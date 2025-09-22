import Foundation
import SwiftUI

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

    init(defaultPath: String? = nil) {
        if let defaultPath {
            self.projectPath = defaultPath
        } else {
            let home = FileManager.default.homeDirectoryForCurrentUser
            self.projectPath = home.appendingPathComponent("Documents/GitStuff/Portf").path
        }
        self.playwrightPort = max(1024, min(65535, 5173))
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
            return
        }

        let url = URL(fileURLWithPath: normalized, isDirectory: true)
        pathIsValid = true
        pathValidationMessage = nil
        devProcess.attachWorkingDirectory(url)
        playwrightProcess.attachWorkingDirectory(url)
    }

    private func updatePlaywrightCommand(announce: Bool = true) {
        let url = "http://localhost:\(playwrightPort)"
        playwrightProcess.updateCommand(["npx", "playwright", "codegen", url], announce: announce)
    }
}
