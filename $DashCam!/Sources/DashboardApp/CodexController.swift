import Combine
import Foundation

@MainActor
final class CodexController: ObservableObject {
  enum Status: Equatable {
    case idle
    case sending
    case failed(message: String)
  }

  struct Entry: Identifiable, Equatable {
    enum Role: String {
      case user
      case assistant
      case info
      case error
    }

    let id: UUID
    let role: Role
    let text: String
    let timestamp: Date

    init(id: UUID = UUID(), role: Role, text: String, timestamp: Date = Date()) {
      self.id = id
      self.role = role
      self.text = text
      self.timestamp = timestamp
    }
  }

  @Published private(set) var entries: [Entry]
  @Published private(set) var status: Status = .idle
  @Published var commandPath: String
  @Published var commandArguments: String
  @Published var includeProjectContext: Bool
  @Published private(set) var projectSummary: String?
  @Published private(set) var isProcessing: Bool = false

  private var projectDirectoryURL: URL?
  private let historyLimit = 60

  init(
    commandPath: String = ProcessInfo.processInfo.environment["CODEX_COMMAND"] ?? "codex",
    commandArguments: String = ProcessInfo.processInfo.environment["CODEX_ARGS"] ?? ""
  ) {
    self.commandPath = commandPath
    self.commandArguments = commandArguments
    self.includeProjectContext = true
    self.entries = [
      Entry(role: .info, text: "Connected to Codex. Provide a prompt and press Send to begin.")
    ]
  }

  var collapsedSummary: String? {
    entries.reversed().first { $0.role == .assistant }?.text.trimmingCharacters(
      in: .whitespacesAndNewlines)
  }

  var isCommandConfigured: Bool {
    !commandPath.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
  }

  func updateProjectDirectory(_ path: String?) {
    guard let path, !path.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
      projectDirectoryURL = nil
      projectSummary = nil
      return
    }
    let expanded = NSString(string: path).expandingTildeInPath
    projectDirectoryURL = URL(fileURLWithPath: expanded, isDirectory: true)
    projectSummary = expanded
  }

  func clearHistory() {
    entries = [Entry(role: .info, text: "Conversation cleared.")]
    status = .idle
  }

  func sendPrompt(_ text: String) {
    let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmed.isEmpty else { return }
    guard !isProcessing else {
      appendEntry(role: .info, text: "Codex is already responding. Please wait.")
      return
    }

    appendEntry(role: .user, text: trimmed)

    let context: CommandContext
    do {
      context = try buildCommandContext()
    } catch {
      let message = CodexController.describe(error: error)
      appendEntry(role: .error, text: message)
      status = .failed(message: message)
      return
    }

    let payload = promptPayload()

    status = .sending
    isProcessing = true

    Task(priority: .userInitiated) { [weak self] in
      do {
        let reply = try await CodexController.execute(prompt: payload, context: context)
        await MainActor.run {
          guard let self else { return }
          self.appendEntry(role: .assistant, text: reply)
          self.status = .idle
          self.isProcessing = false
        }
      } catch {
        let message = CodexController.describe(error: error)
        await MainActor.run {
          guard let self else { return }
          self.appendEntry(role: .error, text: message)
          self.status = .failed(message: message)
          self.isProcessing = false
        }
      }
    }
  }

  private func promptPayload() -> String {
    var sections: [String] = [systemPrompt()]
    let conversation =
      entries
      .filter { $0.role == .user || $0.role == .assistant }
      .map { entry -> String in
        switch entry.role {
        case .user:
          return "User: \(entry.text)"
        case .assistant:
          return "Codex: \(entry.text)"
        case .info, .error:
          return ""
        }
      }
      .filter { !$0.isEmpty }

    if !conversation.isEmpty {
      sections.append("Conversation so far:\n" + conversation.joined(separator: "\n"))
    }

    sections.append("Provide the next Codex response.")
    return sections.joined(separator: "\n\n")
  }

  private func appendEntry(role: Entry.Role, text: String) {
    let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmed.isEmpty else { return }
    entries.append(Entry(role: role, text: trimmed))
    enforceHistoryLimit()
  }

  private func enforceHistoryLimit() {
    let overflow = entries.count - historyLimit
    guard overflow > 0 else { return }

    var trimmed: [Entry] = []
    var removed = 0
    for entry in entries {
      if entry.role == .info {
        trimmed.append(entry)
        continue
      }
      if removed < overflow {
        removed += 1
        continue
      }
      trimmed.append(entry)
    }
    entries = trimmed
  }

  private func buildCommandContext() throws -> CommandContext {
    let binary = commandPath.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !binary.isEmpty else {
      throw CodexError.commandNotConfigured
    }
    
    // Validate that the command exists and is executable
    let resolvedPath = try validateCommand(binary, environment: configuredEnvironment())
    
    let args = CodexController.shellSplit(commandArguments)
    return CommandContext(
      binary: resolvedPath,
      arguments: args,
      environment: configuredEnvironment(),
      workingDirectory: projectDirectoryURL
    )
  }

  private func configuredEnvironment() -> [String: String] {
    var env = ProcessInfo.processInfo.environment
    let defaultPaths = "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
    let currentPath = env["PATH"] ?? ""
    if !currentPath.contains("/opt/homebrew/bin") {
      env["PATH"] = defaultPaths + (currentPath.isEmpty ? "" : ":" + currentPath)
    }
    return env
  }

  private func validateCommand(_ binary: String, environment: [String: String]) throws -> String {
    // If it's an absolute path, check if it exists and is executable
    if binary.starts(with: "/") {
      let fileManager = FileManager.default
      guard fileManager.fileExists(atPath: binary) else {
        throw CodexError.commandNotFound(binary)
      }
      guard fileManager.isExecutableFile(atPath: binary) else {
        throw CodexError.commandNotExecutable(binary)
      }
      return binary
    }
    
    // Otherwise, search in PATH
    let pathEnv = environment["PATH"] ?? ""
    let pathComponents = pathEnv.split(separator: ":").map(String.init)
    
    for pathDir in pathComponents {
      let fullPath = "\(pathDir)/\(binary)"
      let fileManager = FileManager.default
      if fileManager.fileExists(atPath: fullPath) && fileManager.isExecutableFile(atPath: fullPath) {
        return fullPath
      }
    }
    
    throw CodexError.commandNotFound(binary)
  }

  private func systemPrompt() -> String {
    var prompt =
      "You are Codex, an expert engineering assistant embedded in the DashCam! macOS dashboard. Provide concise, Markdown-formatted answers with actionable steps and code where it helps. If more detail is needed, ask clarifying questions first."
    if includeProjectContext, let summary = projectSummary {
      prompt +=
        " The active project directory is \(summary). Reference files relative to this directory when suggesting edits."
    }
    prompt +=
      " Prefer short command snippets (use fenced code blocks) and call out risky operations explicitly."
    return prompt
  }

  private static func shellSplit(_ input: String) -> [String] {
    guard !input.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return [] }
    var results: [String] = []
    var current = ""
    var inSingle = false
    var inDouble = false
    var escape = false

    for character in input {
      if escape {
        current.append(character)
        escape = false
        continue
      }
      switch character {
      case "\\":
        if inSingle {
          current.append(character)
        } else {
          escape = true
        }
      case "\"":
        if inSingle {
          current.append(character)
        } else {
          inDouble.toggle()
        }
      case "'":
        if inDouble {
          current.append(character)
        } else {
          inSingle.toggle()
        }
      case " ", "\t", "\n":
        if inSingle || inDouble {
          current.append(character)
        } else {
          if !current.isEmpty {
            results.append(current)
            current.removeAll(keepingCapacity: true)
          }
        }
      default:
        current.append(character)
      }
    }

    if !current.isEmpty {
      results.append(current)
    }
    return results
  }

  nonisolated private static func execute(prompt: String, context: CommandContext) async throws
    -> String
  {
    try await Task.detached(priority: .userInitiated) {
      let process = Process()
      // Use the resolved binary path directly instead of /usr/bin/env
      process.executableURL = URL(fileURLWithPath: context.binary)
      process.arguments = context.arguments
      process.environment = context.environment
      process.currentDirectoryURL = context.workingDirectory

      let stdinPipe = Pipe()
      let stdoutPipe = Pipe()
      let stderrPipe = Pipe()

      process.standardInput = stdinPipe
      process.standardOutput = stdoutPipe
      process.standardError = stderrPipe

      try process.run()

      if let data = (prompt + "\n").data(using: .utf8) {
        stdinPipe.fileHandleForWriting.write(data)
      }
      stdinPipe.fileHandleForWriting.closeFile()

      process.waitUntilExit()

      let stdoutData = stdoutPipe.fileHandleForReading.readDataToEndOfFile()
      let stderrData = stderrPipe.fileHandleForReading.readDataToEndOfFile()
      let stdout = String(data: stdoutData, encoding: .utf8) ?? ""
      let stderr = String(data: stderrData, encoding: .utf8) ?? ""

      if process.terminationStatus != 0 {
        throw CodexError.commandExited(code: process.terminationStatus, stderr: stderr)
      }

      let trimmed = stdout.trimmingCharacters(in: .whitespacesAndNewlines)
      return trimmed.isEmpty ? "Codex command completed with no output." : trimmed
    }.value
  }

  nonisolated private static func describe(error: Error) -> String {
    if let codexError = error as? CodexError, let description = codexError.errorDescription {
      return description
    }
    if let posix = error as? POSIXError {
      return posix.localizedDescription
    }
    if let cocoa = error as? CocoaError {
      return cocoa.localizedDescription
    }
    return error.localizedDescription
  }
}

private struct CommandContext {
  let binary: String
  let arguments: [String]
  let environment: [String: String]
  let workingDirectory: URL?
}

enum CodexError: LocalizedError {
  case commandNotConfigured
  case commandNotFound(String)
  case commandNotExecutable(String)
  case commandExited(code: Int32, stderr: String)

  var errorDescription: String? {
    switch self {
    case .commandNotConfigured:
      return "Set the Codex command before sending prompts."
    case let .commandNotFound(binary):
      return "Command '\(binary)' not found. Please check the command path and ensure it's installed."
    case let .commandNotExecutable(binary):
      return "Command '\(binary)' is not executable. Please check the file permissions."
    case let .commandExited(code, stderr):
      let message = stderr.trimmingCharacters(in: .whitespacesAndNewlines)
      if message.isEmpty {
        return "Codex command exited with status \(code)."
      }
      return "Codex command exited with status \(code): \(message)"
    }
  }
}
