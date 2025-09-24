import AppKit
import SwiftUI

@main
struct DashboardApp: App {
  @NSApplicationDelegateAdaptor(DashboardAppDelegate.self) private var appDelegate
  @StateObject private var viewModel = DashboardViewModel()

  var body: some Scene {
    WindowGroup("Dev Workflow Dashboard") {
      ContentView()
        .environmentObject(viewModel)
        .onAppear {
          NSApp.activate(ignoringOtherApps: true)
          appDelegate.setViewModel(viewModel)
        }
    }
    .defaultSize(width: 900, height: 650)
    .commands {
      CommandGroup(after: .appInfo) {
        Button("Stop All Tasks") {
          viewModel.stopAll()
        }
        .keyboardShortcut(".", modifiers: [.command, .shift])
        .disabled(!viewModel.anyProcessRunning)
      }
    }
  }
}

final class DashboardAppDelegate: NSObject, NSApplicationDelegate {
  private var viewModel: DashboardViewModel?

  func applicationDidFinishLaunching(_ notification: Notification) {
    NSApp.setActivationPolicy(.regular)
    NSApp.activate(ignoringOtherApps: true)
  }

  func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
    true
  }

  func applicationWillTerminate(_ notification: Notification) {
    viewModel?.stopAll()
  }

  func setViewModel(_ viewModel: DashboardViewModel) {
    self.viewModel = viewModel
  }
}
