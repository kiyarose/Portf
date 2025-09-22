import Foundation
import Combine
import Darwin

@MainActor
final class ProcessController: ObservableObject {
    enum Status: Equatable {
        case idle
        case starting
        case running
        case stopping
        case restarting
        case failed(message: String)
    }

    enum Level: Hashable {
        case neutral
        case success
        case warning
        case error
    }

    let name: String
    private var command: [String]

    @Published private(set) var status: Status = .idle
    @Published private(set) var log: String = ""
    @Published private(set) var lastExitCode: Int32?

    var workingDirectory: URL?

    private var process: Process?
    private var stdOutPipe: Pipe?
    private var stdErrPipe: Pipe?
    private var pendingRestart = false

    private let logLimit = 40_000

    init(name: String, command: [String]) {
        self.name = name
        self.command = command
    }

    var isRunning: Bool {
        process?.isRunning ?? false
    }

    var statusText: String {
        switch status {
        case .idle:
            return "Idle"
        case .starting:
            return "Starting…"
        case .running:
            return "Running"
        case .stopping:
            return "Stopping…"
        case .restarting:
            return "Restarting…"
        case .failed(let message):
            return "Failed: \(message)"
        }
    }

    var statusLevel: Level {
        switch status {
        case .idle:
            return .neutral
        case .starting, .stopping, .restarting:
            return .warning
        case .running:
            return .success
        case .failed:
            return .error
        }
    }

    func attachWorkingDirectory(_ url: URL?) {
        workingDirectory = url
    }

    func start() {
        if let existingProcess = process {
            if existingProcess.isRunning {
                if status == .stopping || status == .restarting {
                    appendLog("⏳ Stop in progress — will launch again once the current process exits.")
                    pendingRestart = true
                } else {
                    appendLog("⚠️ Attempted to start while already running.")
                }
                return
            }

            cleanupProcess()
            status = .idle
        }

        guard let workingDirectory else {
            status = .failed(message: "Set project directory first")
            appendLog("❌ Cannot launch \(name); working directory not set.")
            return
        }

        var isDirectory: ObjCBool = false
        guard FileManager.default.fileExists(atPath: workingDirectory.path, isDirectory: &isDirectory), isDirectory.boolValue else {
            status = .failed(message: "Invalid directory")
            appendLog("❌ Working directory is missing or not a folder: \(workingDirectory.path)")
            return
        }

        status = pendingRestart ? .restarting : .starting
        appendLog("🚀 Launching \(name): \(formattedCommand())")

        let task = Process()
        task.executableURL = URL(fileURLWithPath: "/usr/bin/env")
        task.arguments = command
        task.currentDirectoryURL = workingDirectory
        task.environment = configuredEnvironment()

        let stdOut = Pipe()
        let stdErr = Pipe()

        stdOut.fileHandleForReading.readabilityHandler = { [weak self] handle in
            guard let self else { return }
            let data = handle.availableData
            guard !data.isEmpty, let text = String(data: data, encoding: .utf8), !text.isEmpty else { return }
            Task { @MainActor in
                self.appendLog(text)
            }
        }

        stdErr.fileHandleForReading.readabilityHandler = { [weak self] handle in
            guard let self else { return }
            let data = handle.availableData
            guard !data.isEmpty, let text = String(data: data, encoding: .utf8), !text.isEmpty else { return }
            Task { @MainActor in
                self.appendLog(text, prefix: "⚠️ ")
            }
        }

        task.standardOutput = stdOut
        task.standardError = stdErr

        task.terminationHandler = { [weak self] process in
            guard let self else { return }
            Task { @MainActor in
                self.handleTermination(of: process)
            }
        }

        do {
            try task.run()
            process = task
            stdOutPipe = stdOut
            stdErrPipe = stdErr
            status = .running
        } catch {
            cleanupProcess()
            pendingRestart = false
            status = .failed(message: error.localizedDescription)
            appendLog("❌ Failed to launch: \(error.localizedDescription)")
        }
    }

    func stop(force: Bool = true, cancelRestart: Bool = true) {
        guard let process else { return }
        appendLog("🛑 Stopping \(name)")
        status = .stopping
        if cancelRestart {
            pendingRestart = false
        }

        if !process.isRunning {
            handleTermination(of: process)
            return
        }

        process.interrupt()

        DispatchQueue.global().asyncAfter(deadline: .now() + 2) { [weak self] in
            Task { @MainActor [weak self] in
                guard let self else { return }
                guard let runningProcess = self.process, runningProcess === process else { return }
                if !runningProcess.isRunning {
                    self.handleTermination(of: runningProcess)
                    return
                }

                self.appendLog("🔁 Interrupt ignored — sending terminate.")
                runningProcess.terminate()

                DispatchQueue.global().asyncAfter(deadline: .now() + 3) { [weak self] in
                    Task { @MainActor [weak self] in
                        guard let self else { return }
                        guard let stillRunning = self.process, stillRunning === process else { return }
                        if !stillRunning.isRunning {
                            self.handleTermination(of: stillRunning)
                            return
                        }

                        guard force else { return }
                        let pid = stillRunning.processIdentifier
                        self.appendLog("⏱️ Terminate ignored — forcing \(self.name) to close.")
                        kill(pid, SIGKILL)
                    }
                }
            }
        }
    }

    func restart() {
        if isRunning {
            pendingRestart = true
            stop(cancelRestart: false)
        } else {
            start()
        }
    }

    func clearLog() {
        log = ""
    }

    func formattedCommand() -> String {
        command.joined(separator: " ")
    }

    func updateCommand(_ newCommand: [String], announce: Bool = true) {
        guard command != newCommand else { return }
        command = newCommand
        if announce {
            appendLog("🔧 Updated command: \(formattedCommand())")
        }
    }

    private func appendLog(_ text: String, prefix: String = "") {
        var line = prefix + text
        if !line.hasSuffix("\n") {
            line.append("\n")
        }
        log = line + log
        trimLogIfNeeded()
    }

    private func trimLogIfNeeded() {
        guard log.count > logLimit else { return }
        let overflow = log.count - logLimit
        guard overflow > 0 else { return }
        if let index = log.index(log.startIndex, offsetBy: overflow, limitedBy: log.endIndex) {
            log = String(log[index...])
        }
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

    private func cleanupProcess() {
        stdOutPipe?.fileHandleForReading.readabilityHandler = nil
        stdErrPipe?.fileHandleForReading.readabilityHandler = nil
        stdOutPipe?.fileHandleForReading.closeFile()
        stdErrPipe?.fileHandleForReading.closeFile()
        stdOutPipe = nil
        stdErrPipe = nil
        process = nil
    }

    private func handleTermination(of process: Process) {
        guard let currentProcess = self.process, currentProcess === process else { return }

        let shouldRestart = pendingRestart
        pendingRestart = false

        lastExitCode = process.terminationStatus
        appendLog("ℹ️ \(name) exited with status \(process.terminationStatus)")
        cleanupProcess()

        if shouldRestart {
            start()
        } else {
            status = .idle
        }
    }
}
