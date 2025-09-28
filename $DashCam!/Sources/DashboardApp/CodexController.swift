import Combine
import Darwin
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
    let args = CodexController.shellSplit(commandArguments)
    return CommandContext(
      binary: binary,
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
      do {
        return try runCodexCommand(prompt: prompt, context: context, usePseudoTerminal: false)
      } catch {
        guard case let CodexError.commandExited(code, stderr) = error,
          code != 0,
          stderr.localizedCaseInsensitiveContains("device not configured")
            || stderr.localizedCaseInsensitiveContains("os error 6")
        else {
          throw error
        }
        return try runCodexCommand(prompt: prompt, context: context, usePseudoTerminal: true)
      }
    }.value
  }

  nonisolated private static func runCodexCommand(
    prompt: String,
    context: CommandContext,
    usePseudoTerminal: Bool
  ) throws -> String {
    let result: CommandResult
    if usePseudoTerminal {
      result = try runWithPseudoTerminal(prompt: prompt, context: context)
    } else {
      result = try runWithPipes(prompt: prompt, context: context)
    }

    if result.exitCode != 0 {
      throw CodexError.commandExited(code: result.exitCode, stderr: result.stderr)
    }

    let trimmed = result.stdout.trimmingCharacters(in: .whitespacesAndNewlines)
    return trimmed.isEmpty ? "Codex command completed with no output." : trimmed
  }

  nonisolated private static func runWithPipes(prompt: String, context: CommandContext) throws
    -> CommandResult
  {
    let process = Process()
    process.executableURL = URL(fileURLWithPath: "/usr/bin/env")
    process.arguments = [context.binary] + context.arguments
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

    return CommandResult(exitCode: process.terminationStatus, stdout: stdout, stderr: stderr)
  }

    let process = Process()
    process.executableURL = URL(fileURLWithPath: "/usr/bin/env")
    process.arguments = [context.binary] + context.arguments
    process.environment = context.environment
    process.currentDirectoryURL = context.workingDirectory

    let inputPipe = Pipe()
    let outputPipe = Pipe()
    let errorPipe = Pipe()

    process.standardInput = inputPipe
    process.standardOutput = outputPipe
    process.standardError = errorPipe

    var stdoutData = Data()
    var stderrData = Data()
    let captureGroup = DispatchGroup()

    // Capture stdout
    captureGroup.enter()
    DispatchQueue.global(qos: .userInitiated).async {
      let data = outputPipe.fileHandleForReading.readDataToEndOfFile()
      stdoutData.append(data)
      captureGroup.leave()
    }

    // Capture stderr
    captureGroup.enter()
    DispatchQueue.global(qos: .userInitiated).async {
      let data = errorPipe.fileHandleForReading.readDataToEndOfFile()
      stderrData.append(data)
      captureGroup.leave()
    }

    try process.run()

    // Write prompt to stdin
    if let data = (prompt + "\n").data(using: .utf8) {
      inputPipe.fileHandleForWriting.write(data)
    }
    // Send EOF
    inputPipe.fileHandleForWriting.write(Data([0x04]))
    inputPipe.fileHandleForWriting.closeFile()

    process.waitUntilExit()
    captureGroup.wait()

    let stdoutString = String(data: stdoutData, encoding: .utf8) ?? ""
    let stderrString = String(data: stderrData, encoding: .utf8) ?? ""
    return CommandResult(exitCode: process.terminationStatus, stdout: stdoutString, stderr: stderrString)
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

private struct CommandResult {
  let exitCode: Int32
  let stdout: String
  let stderr: String
}

enum CodexError: LocalizedError {
  case commandNotConfigured
  case commandExited(code: Int32, stderr: String)

  var errorDescription: String? {
    switch self {
    case .commandNotConfigured:
      return "Set the Codex command before sending prompts."
    case let .commandExited(code, stderr):
      let message = stderr.trimmingCharacters(in: .whitespacesAndNewlines)
      if message.isEmpty {
        return "Codex command exited with status \(code)."
      }
      return "Codex command exited with status \(code): \(message)"
    }
  }
}
