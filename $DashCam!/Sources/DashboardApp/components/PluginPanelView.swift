import SwiftUI

struct PluginPanelView: View {
  enum Mode {
    case embedded
    case detached
  }

  let plugin: PluginKind
  var mode: Mode = .embedded
  var onPopOut: (() -> Void)?
  var onReturnToMain: (() -> Void)?

  @EnvironmentObject private var viewModel: DashboardViewModel

  var body: some View {
    pluginContent
      .overlay(alignment: .topTrailing) {
        switch mode {
        case .embedded:
          popOutButton
        case .detached:
          popInButton
        }
      }
  }

  @ViewBuilder
  private var pluginContent: some View {
    switch plugin {
    case .server:
      ServerMGM(
        controller: viewModel.devProcess,
        isCollapsed: collapseBinding(for: .server),
        preferredHeight: heightBinding(for: .server)
      )
    case .playwright:
      PlaywrightMGM(
        port: Binding(
          get: { viewModel.playwrightPort },
          set: { viewModel.playwrightPort = $0 }
        ),
        controller: viewModel.playwrightProcess,
        isCollapsed: collapseBinding(for: .playwright),
        preferredHeight: heightBinding(for: .playwright)
      )
    case .gitter:
      GitterMGM(
        controller: viewModel.gitController,
        isCollapsed: collapseBinding(for: .gitter),
        preferredHeight: heightBinding(for: .gitter),
        pathIsValid: viewModel.pathIsValid
      )
    case .codex:
      CodexMGM(
        controller: viewModel.codexController,
        isCollapsed: collapseBinding(for: .codex),
        preferredHeight: heightBinding(for: .codex)
      )
    }
  }

  private var popOutButton: some View {
    Button {
      onPopOut?()
      viewModel.popOut(plugin: plugin)
    } label: {
      Image(systemName: "arrow.up.right.square")
        .font(.system(size: 15, weight: .semibold))
        .padding(8)
    }
    .accessibilityLabel("Pop out \(plugin.displayName)")
    .buttonStyle(.plain)
    .background(.thinMaterial)
    .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    .shadow(radius: 2, y: 1)
  }

  private var popInButton: some View {
    Button {
      if let onReturnToMain {
        onReturnToMain()
      } else {
        viewModel.returnPluginToMain(plugin: plugin)
      }
    } label: {
      HStack(spacing: 6) {
        Image(systemName: "arrow.down.to.line")
        Text("Return to Main")
      }
      .font(.footnote.weight(.semibold))
      .padding(.horizontal, 10)
      .padding(.vertical, 6)
    }
    .buttonStyle(.borderedProminent)
    .tint(.accentColor)
    .accessibilityLabel("Return \(plugin.displayName) to main window")
  }

  private func collapseBinding(for plugin: PluginKind) -> Binding<Bool> {
    switch plugin {
    case .server:
      return Binding(
        get: { viewModel.isServerCollapsed },
        set: { viewModel.isServerCollapsed = $0 }
      )
    case .playwright:
      return Binding(
        get: { viewModel.isPlaywrightCollapsed },
        set: { viewModel.isPlaywrightCollapsed = $0 }
      )
    case .gitter:
      return Binding(
        get: { viewModel.isGitterCollapsed },
        set: { viewModel.isGitterCollapsed = $0 }
      )
    case .codex:
      return Binding(
        get: { viewModel.isCodexCollapsed },
        set: { viewModel.isCodexCollapsed = $0 }
      )
    }
  }

  private func heightBinding(for plugin: PluginKind) -> Binding<CGFloat> {
    switch plugin {
    case .server:
      return Binding(
        get: { viewModel.serverPanelHeight },
        set: { viewModel.serverPanelHeight = $0 }
      )
    case .playwright:
      return Binding(
        get: { viewModel.playwrightPanelHeight },
        set: { viewModel.playwrightPanelHeight = $0 }
      )
    case .gitter:
      return Binding(
        get: { viewModel.gitterPanelHeight },
        set: { viewModel.gitterPanelHeight = $0 }
      )
    case .codex:
      return Binding(
        get: { viewModel.codexPanelHeight },
        set: { viewModel.codexPanelHeight = $0 }
      )
    }
  }
}

struct DetachedPluginPlaceholder: View {
  let plugin: PluginKind

  @EnvironmentObject private var viewModel: DashboardViewModel

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      HStack(spacing: 12) {
        Image(systemName: "rectangle.on.rectangle")
          .font(.title3.weight(.semibold))
          .foregroundStyle(.secondary)
        Text("\(plugin.displayName) is open in a separate window.")
          .font(.headline)
      }
      Text("Close the window or use the controls below to bring the panel back into the dashboard.")
        .font(.subheadline)
        .foregroundStyle(.secondary)

      HStack(spacing: 12) {
        Button("Focus Window") {
          viewModel.focusWindow(for: plugin)
        }
        .buttonStyle(.bordered)

        Button("Return Here") {
          viewModel.returnPluginToMain(plugin: plugin)
        }
        .buttonStyle(.borderedProminent)
      }
    }
    .padding(24)
    .frame(maxWidth: .infinity, alignment: .leading)
    .background(.thinMaterial)
    .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
  }
}
