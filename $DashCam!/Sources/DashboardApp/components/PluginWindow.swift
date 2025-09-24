import AppKit
import SwiftUI

@MainActor
final class PluginWindowController: NSWindowController, NSWindowDelegate {
    private weak var dashboardViewModel: DashboardViewModel?
    private let plugin: PluginKind

    init(plugin: PluginKind, viewModel: DashboardViewModel) {
        self.plugin = plugin
        self.dashboardViewModel = viewModel

        let rootView = PluginWindowContent(plugin: plugin)
            .environmentObject(viewModel)

        let hostingController = NSHostingController(rootView: rootView)
        let window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 520, height: 560),
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        window.contentViewController = hostingController
        window.title = plugin.windowTitle
        window.isReleasedWhenClosed = false
        window.contentMinSize = NSSize(width: 400, height: 360)
        window.center()

        super.init(window: window)
        window.delegate = self
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    func showPluginWindow() {
        showWindow(nil)
        window?.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    func windowWillClose(_ notification: Notification) {
        dashboardViewModel?.onPluginWindowClosed(plugin)
    }
}

private struct PluginWindowContent: View {
    let plugin: PluginKind
    @EnvironmentObject private var viewModel: DashboardViewModel

    var body: some View {
        PluginPanelView(
            plugin: plugin,
            mode: .detached
        )
        .padding(20)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .frame(minWidth: 400, minHeight: 360, alignment: .topLeading)
        .background(Color(nsColor: .windowBackgroundColor))
    }
}
