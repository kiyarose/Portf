import AppKit
import Foundation
import SwiftUI

private enum PanelSizing {
    static let range: ClosedRange<CGFloat> = 160...420

    static func clamp(_ value: CGFloat) -> CGFloat {
        min(max(value, range.lowerBound), range.upperBound)
    }
}

enum PluginKind: String, CaseIterable, Identifiable, Codable {
    case server
    case playwright

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .server:
            return "Dev Server"
        case .playwright:
            return "Playwright Codegen"
        }
    }

    var windowTitle: String { displayName }
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
    private let defaultProjectPath: String
    @Published var pluginOrder: [PluginKind] {
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

    private enum CollapseKey {
        static let project = "dashboard.collapse.project"
        static let server = "dashboard.collapse.server"
        static let playwright = "dashboard.collapse.playwright"
    }

    private enum DimensionKey {
        static let server = "dashboard.dimension.server"
        static let playwright = "dashboard.dimension.playwright"
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
        let serverHeight = defaults.object(forKey: DimensionKey.server) as? Double ?? 240
        let playwrightHeight = defaults.object(forKey: DimensionKey.playwright) as? Double ?? 240
        self.serverPanelHeight = PanelSizing.clamp(CGFloat(serverHeight))
        self.playwrightPanelHeight = PanelSizing.clamp(CGFloat(playwrightHeight))
        if let storedOrder = defaults.array(forKey: OrderKey.plugins) as? [String] {
            let decoded = storedOrder.compactMap { PluginKind(rawValue: $0) }
            self.pluginOrder = decoded.isEmpty ? PluginKind.allCases : decoded
        } else {
            self.pluginOrder = PluginKind.allCases
        }
        self.devProcess = ProcessController(name: "Dev Server", command: ["npm", "run", "dev"])
        self.playwrightProcess = ProcessController(
            name: "Playwright Codegen",
            command: ["npx", "playwright", "codegen", "http://localhost:5173"]
        )
        refreshWorkingDirectories()
        updatePlaywrightCommand(announce: false)
    }

    var anyProcessRunning: Bool {
        devProcess.isRunning || playwrightProcess.isRunning
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
            isProjectDirectoryCollapsed = false
            return
        }

        let url = URL(fileURLWithPath: normalized, isDirectory: true)
        pathIsValid = true
        pathValidationMessage = nil
        devProcess.attachWorkingDirectory(url)
        playwrightProcess.attachWorkingDirectory(url)
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
