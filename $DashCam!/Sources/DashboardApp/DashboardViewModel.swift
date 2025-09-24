import AppKit
import Combine
import Foundation
import SwiftUI

private enum PanelSizing {
    static let range: ClosedRange<CGFloat> = 120...420

    static func clamp(_ value: CGFloat) -> CGFloat {
        min(max(value, range.lowerBound), range.upperBound)
    }
}

enum PluginKind: String, CaseIterable, Identifiable, Codable {
    case server
    case playwright
    case gitter
    case codex

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .server:
            return "Dev Server"
        case .playwright:
            return "Playwright Codegen"
        case .gitter:
            return "Gitter"
        case .codex:
            return "Codex"
        }
    }

    var windowTitle: String { displayName }

    var column: PluginColumn {
        switch self {
        case .server, .playwright:
            return .primary
        case .gitter, .codex:
            return .secondary
        }
    }
}

enum PluginColumn: CaseIterable, Identifiable {
    case primary
    case secondary

    var id: Self { self }
}

@MainActor
final class DashboardViewModel: ObservableObject {
    @Published var projectPath: String {
        didSet {
            refreshWorkingDirectories()
        }
    }

    @Published var playwrightPort: Int {
        didSet {
            if playwrightPort < 1024 {
                playwrightPort = 1024
                return
            }
            if playwrightPort > 65535 {
                playwrightPort = 65535
                return
            }
            updatePlaywrightCommand()
        }
    }

    @Published private(set) var pathIsValid: Bool = false
    @Published private(set) var pathValidationMessage: String?

    let devProcess: ProcessController
    let playwrightProcess: ProcessController
    let gitController: GitController
    let codexController: CodexController
    private let defaultProjectPath: String
    @Published var pluginOrder: [PluginKind] = PluginKind.allCases {
        didSet {
            persistPluginOrder()
        }
    }
    @Published var detachedPlugins: Set<PluginKind> = []
    @Published var isProjectDirectoryCollapsed: Bool {
        didSet {
            persistCollapseState(key: CollapseKey.project, value: isProjectDirectoryCollapsed)
        }
    }

    @Published var isServerCollapsed: Bool {
        didSet {
            persistCollapseState(key: CollapseKey.server, value: isServerCollapsed)
        }
    }

    @Published var isPlaywrightCollapsed: Bool {
        didSet {
            persistCollapseState(key: CollapseKey.playwright, value: isPlaywrightCollapsed)
        }
    }

    @Published var isGitterCollapsed: Bool {
        didSet {
            persistCollapseState(key: CollapseKey.gitter, value: isGitterCollapsed)
        }
    }

    @Published var isCodexCollapsed: Bool {
        didSet {
            persistCollapseState(key: CollapseKey.codex, value: isCodexCollapsed)
        }
    }

    @Published var serverPanelHeight: CGFloat {
        didSet {
            let clamped = PanelSizing.clamp(serverPanelHeight)
            if serverPanelHeight != clamped {
                serverPanelHeight = clamped
                return
            }
            persistDimension(key: DimensionKey.server, value: serverPanelHeight)
        }
    }

    @Published var playwrightPanelHeight: CGFloat {
        didSet {
            let clamped = PanelSizing.clamp(playwrightPanelHeight)
            if playwrightPanelHeight != clamped {
                playwrightPanelHeight = clamped
                return
            }
            persistDimension(key: DimensionKey.playwright, value: playwrightPanelHeight)
        }
    }

    @Published var gitterPanelHeight: CGFloat {
        didSet {
            let clamped = PanelSizing.clamp(gitterPanelHeight)
            if gitterPanelHeight != clamped {
                gitterPanelHeight = clamped
                return
            }
            persistDimension(key: DimensionKey.gitter, value: gitterPanelHeight)
        }
    }

    @Published var codexPanelHeight: CGFloat {
        didSet {
            let clamped = PanelSizing.clamp(codexPanelHeight)
            if codexPanelHeight != clamped {
                codexPanelHeight = clamped
                return
            }
            persistDimension(key: DimensionKey.codex, value: codexPanelHeight)
        }
    }

    private enum CollapseKey {
        static let project = "dashboard.collapse.project"
        static let server = "dashboard.collapse.server"
        static let playwright = "dashboard.collapse.playwright"
        static let gitter = "dashboard.collapse.gitter"
        static let codex = "dashboard.collapse.codex"
    }

    private enum DimensionKey {
        static let server = "dashboard.dimension.server"
        static let playwright = "dashboard.dimension.playwright"
        static let gitter = "dashboard.dimension.gitter"
        static let codex = "dashboard.dimension.codex"
    }

    private enum OrderKey {
        static let plugins = "dashboard.plugin.order"
    }

    private var pluginWindows: [PluginKind: PluginWindowController] = [:]

    init(defaultPath: String? = nil) {
        if let defaultPath {
            self.defaultProjectPath = NSString(string: defaultPath).expandingTildeInPath
        } else {
            let home = FileManager.default.homeDirectoryForCurrentUser
            self.defaultProjectPath = home.appendingPathComponent("Documents/GitStuff/Portf").path
        }
        self.projectPath = defaultProjectPath
        self.playwrightPort = max(1024, min(65535, 5173))
        let defaults = UserDefaults.standard
        self.isProjectDirectoryCollapsed = defaults.object(forKey: CollapseKey.project) as? Bool ?? false
        self.isServerCollapsed = defaults.object(forKey: CollapseKey.server) as? Bool ?? false
        self.isPlaywrightCollapsed = defaults.object(forKey: CollapseKey.playwright) as? Bool ?? false
        self.isGitterCollapsed = defaults.object(forKey: CollapseKey.gitter) as? Bool ?? false
        self.isCodexCollapsed = defaults.object(forKey: CollapseKey.codex) as? Bool ?? true

        let serverHeight = defaults.object(forKey: DimensionKey.server) as? Double ?? 200
        let playwrightHeight = defaults.object(forKey: DimensionKey.playwright) as? Double ?? 200
        let gitterHeight = defaults.object(forKey: DimensionKey.gitter) as? Double ?? 200
        let codexHeight = defaults.object(forKey: DimensionKey.codex) as? Double ?? 260
        self.serverPanelHeight = PanelSizing.clamp(CGFloat(serverHeight))
        self.playwrightPanelHeight = PanelSizing.clamp(CGFloat(playwrightHeight))
        self.gitterPanelHeight = PanelSizing.clamp(CGFloat(gitterHeight))
        self.codexPanelHeight = PanelSizing.clamp(CGFloat(codexHeight))

        let restoredOrder: [PluginKind]
        if let storedOrder = defaults.array(forKey: OrderKey.plugins) as? [String] {
            let decoded = storedOrder.compactMap { PluginKind(rawValue: $0) }
            restoredOrder = Self.normalize(order: decoded)
        } else {
            restoredOrder = PluginKind.allCases
        }
        self.devProcess = ProcessController(name: "Dev Server", command: ["npm", "run", "dev"])
        self.playwrightProcess = ProcessController(
            name: "Playwright Codegen",
            command: ["npx", "playwright", "codegen", "http://localhost:5173"]
        )
        self.gitController = GitController()
        self.codexController = CodexController()
        self.pluginOrder = restoredOrder
        refreshWorkingDirectories()
        updatePlaywrightCommand(announce: false)
    }

    var anyProcessRunning: Bool {
        devProcess.isRunning || playwrightProcess.isRunning || gitController.isBusy || codexController.isProcessing
    }

    func setProjectURL(_ url: URL) {
        projectPath = url.path
    }

    func stopAll() {
        devProcess.stop()
        playwrightProcess.stop()
    }

    private func refreshWorkingDirectories() {
        let normalized = NSString(string: projectPath).expandingTildeInPath
        var isDir: ObjCBool = false
        let exists = FileManager.default.fileExists(atPath: normalized, isDirectory: &isDir)

        guard exists, isDir.boolValue else {
            pathIsValid = false
            pathValidationMessage = "Select a valid project folder."
            devProcess.attachWorkingDirectory(nil)
            playwrightProcess.attachWorkingDirectory(nil)
            gitController.attachWorkingDirectory(nil)
            codexController.updateProjectDirectory(nil)
            isProjectDirectoryCollapsed = false
            return
        }

        let url = URL(fileURLWithPath: normalized, isDirectory: true)
        pathIsValid = true
        pathValidationMessage = nil
        devProcess.attachWorkingDirectory(url)
        playwrightProcess.attachWorkingDirectory(url)
        gitController.attachWorkingDirectory(url)
        codexController.updateProjectDirectory(url.path)
        isProjectDirectoryCollapsed = true
    }

    private func updatePlaywrightCommand(announce: Bool = true) {
        let url = "http://localhost:\(playwrightPort)"
        playwrightProcess.updateCommand(["npx", "playwright", "codegen", url], announce: announce)
    }

    private func persistCollapseState(key: String, value: Bool) {
        UserDefaults.standard.set(value, forKey: key)
    }

    private func persistDimension(key: String, value: CGFloat) {
        UserDefaults.standard.set(Double(value), forKey: key)
    }

    private static func normalize(order: [PluginKind]) -> [PluginKind] {
        var seen = Set<PluginKind>()
        var normalized: [PluginKind] = []
        for plugin in order where !seen.contains(plugin) {
            normalized.append(plugin)
            seen.insert(plugin)
        }
        for plugin in PluginKind.allCases where !seen.contains(plugin) {
            normalized.append(plugin)
            seen.insert(plugin)
        }
        return normalized
    }

    private func persistPluginOrder() {
        let rawValues = pluginOrder.map { $0.rawValue }
        UserDefaults.standard.set(rawValues, forKey: OrderKey.plugins)
    }

    func movePlugin(fromOffsets offsets: IndexSet, toOffset destination: Int) {
        pluginOrder.move(fromOffsets: offsets, toOffset: destination)
    }

    func isPluginDetached(_ plugin: PluginKind) -> Bool {
        detachedPlugins.contains(plugin)
    }

    func popOut(plugin: PluginKind) {
        if let controller = pluginWindows[plugin] {
            controller.showPluginWindow()
            return
        }

        let controller = PluginWindowController(plugin: plugin, viewModel: self)
        pluginWindows[plugin] = controller
        detachedPlugins.insert(plugin)
        controller.showPluginWindow()
    }

    func focusWindow(for plugin: PluginKind) {
        pluginWindows[plugin]?.showPluginWindow()
    }

    func returnPluginToMain(plugin: PluginKind) {
        guard let controller = pluginWindows[plugin] else { return }
        controller.close()
    }

    func onPluginWindowClosed(_ plugin: PluginKind) {
        pluginWindows[plugin] = nil
        detachedPlugins.remove(plugin)
    }

    func useCurrentDirectory() {
        if let workingDir = devProcess.workingDirectory?.path, isDirectory(workingDir) {
            projectPath = workingDir
            return
        }

        if let envCwd = ProcessInfo.processInfo.environment["PWD"], isDirectory(envCwd) {
            projectPath = NSString(string: envCwd).expandingTildeInPath
            return
        }

        if isDirectory(defaultProjectPath) {
            projectPath = defaultProjectPath
        }
    }

    private func isDirectory(_ path: String) -> Bool {
        var isDir: ObjCBool = false
        return FileManager.default.fileExists(atPath: path, isDirectory: &isDir) && isDir.boolValue
    }
}

@MainActor
final class GitController: ObservableObject {
    @Published private(set) var log: String = ""
    @Published private(set) var isBusy: Bool = false

    private var workingDirectory: URL?
    private let logLimit = 40_000

    func attachWorkingDirectory(_ url: URL?) {
        workingDirectory = url
    }

    func pull() {
        run(
            description: "Pull latest commits",
            commands: [
                GitCommand(
                    arguments: ["pull"],
                    description: "Fetching and merging remote changes"
                )
            ],
            completionMessage: "Pull complete"
        )
    }

    func push(commitMessage: String) {
        let trimmed = commitMessage.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else {
            appendLog("⚠️ Provide a commit message before pushing changes.")
            return
        }

        run(
            description: "Push local changes",
            commands: [
                GitCommand(
                    arguments: ["add", "--all"],
                    description: "Staging changes"
                ),
                GitCommand(
                    arguments: ["commit", "-m", trimmed],
                    description: "Creating commit",
                    nonZeroHandler: { [weak self] result in
                        guard let self else { return false }
                        let combined = result.combinedOutput.lowercased()
                        if combined.contains("nothing to commit") || combined.contains("no changes added to commit") {
                            appendLog("ℹ️ Nothing to commit; pushing existing commits instead.")
                            return true
                        }
                        return false
                    }
                ),
                GitCommand(
                    arguments: ["push"],
                    description: "Pushing to remote"
                )
            ],
            completionMessage: "Push complete"
        )
    }

    func clearLog() {
        log = ""
    }

    private func run(
        description: String,
        commands: [GitCommand],
        completionMessage: String
    ) {
        guard let workingDirectory else {
            appendLog("❌ Select a valid project directory before running git commands.")
            return
        }
        guard !isBusy else {
            appendLog("⏳ Another git task is in progress. Please wait for it to finish.")
            return
        }

        appendLog("▶️ \(description)")
        isBusy = true

        Task {
            await runSequence(
                commands,
                workingDirectory: workingDirectory,
                completionMessage: completionMessage
            )
        }
    }

    private func runSequence(
        _ commands: [GitCommand],
        workingDirectory: URL,
        completionMessage: String
    ) async {
        defer { isBusy = false }

        for command in commands {
            appendLog("$ git \(command.arguments.joined(separator: " "))")
            do {
                let result = try await executeGitCommand(command.arguments, in: workingDirectory)
                let combinedOutput = result.combinedOutput
                if !combinedOutput.isEmpty {
                    appendLog(combinedOutput)
                }
                if result.exitCode != 0 {
                    if command.nonZeroHandler?(result) == true {
                        continue
                    }
                    appendLog("❌ git \(command.arguments.first ?? "command") exited with status \(result.exitCode)")
                    return
                }
            } catch {
                appendLog("❌ \(error.localizedDescription)")
                return
            }
        }

        appendLog("✅ \(completionMessage)")
    }

    private func executeGitCommand(_ arguments: [String], in directory: URL) async throws -> GitCommandResult {
        let environment = configuredEnvironment()
        return try await Task.detached(priority: .userInitiated) {
            let process = Process()
            process.executableURL = URL(fileURLWithPath: "/usr/bin/env")
            process.arguments = ["git"] + arguments
            process.currentDirectoryURL = directory
            process.environment = environment

            let stdoutPipe = Pipe()
            let stderrPipe = Pipe()
            process.standardOutput = stdoutPipe
            process.standardError = stderrPipe

            try process.run()
            process.waitUntilExit()

            let stdoutData = stdoutPipe.fileHandleForReading.readDataToEndOfFile()
            let stderrData = stderrPipe.fileHandleForReading.readDataToEndOfFile()
            let stdout = String(data: stdoutData, encoding: .utf8) ?? ""
            let stderr = String(data: stderrData, encoding: .utf8) ?? ""

            return GitCommandResult(
                exitCode: process.terminationStatus,
                stdout: stdout,
                stderr: stderr
            )
        }.value
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

    private func appendLog(_ entry: String) {
        var line = entry
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
}

private struct GitCommand {
    let arguments: [String]
    let description: String
    var nonZeroHandler: ((GitCommandResult) -> Bool)? = nil
}

struct GitCommandResult {
    let exitCode: Int32
    let stdout: String
    let stderr: String

    var combinedOutput: String {
        let merged = [stdout, stderr]
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }
        return merged.joined(separator: "\n")
    }
}
