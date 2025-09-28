import SwiftUI

struct CodexMGM: View {
  @ObservedObject var controller: ProcessController
  @Binding var isCollapsed: Bool
  @Binding var preferredHeight: CGFloat

  var body: some View {
    ProcessCard(
      controller: controller,
      description:
        "Interactive Codex assistant for development tasks. Uses the command configured in environment variables or 'codex' by default.",
      isCollapsed: $isCollapsed,
      preferredHeight: $preferredHeight
    ) {
      CodexControls(controller: controller)
    }
    .layoutPriority(1)
  }
}

private struct CodexControls: View {
  @ObservedObject var controller: ProcessController
  @State private var codexCommand: String =
    ProcessInfo.processInfo.environment["CODEX_COMMAND"] ?? "codex"

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      HStack(spacing: 12) {
        Text("Command:")
          .font(.subheadline)
          .foregroundStyle(.secondary)
        TextField("codex", text: $codexCommand)
          .textFieldStyle(.roundedBorder)
          .onSubmit {
            updateCommand()
          }
      }

      Text(
        "Configure the codex command to use. Set CODEX_COMMAND environment variable or modify here."
      )
      .font(.footnote)
      .foregroundStyle(.secondary)
    }
    .onAppear {
      updateCommand()
    }
  }

  private func updateCommand() {
    controller.updateCommand([codexCommand])
  }
}
