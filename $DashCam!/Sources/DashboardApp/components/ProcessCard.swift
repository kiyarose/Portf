import SwiftUI

struct ProcessCard<ExtraContent: View>: View {
    @ObservedObject var controller: ProcessController
    var description: String
    var extraContent: ExtraContent

    private let statusColors: [ProcessController.Level: Color] = [
        .neutral: .secondary,
        .success: .green,
        .warning: .orange,
        .error: .red
    ]

    init(controller: ProcessController, description: String, @ViewBuilder extraContent: () -> ExtraContent) {
        self.controller = controller
        self.description = description
        self.extraContent = extraContent()
    }

    init(controller: ProcessController, description: String) where ExtraContent == EmptyView {
        self.controller = controller
        self.description = description
        self.extraContent = EmptyView()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            header
            actionButtons
            extraContent
            LogView(text: controller.log)
            footer
        }
        .padding(20)
        .background(.regularMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
    }

    private var header: some View {
        HStack(alignment: .firstTextBaseline) {
            VStack(alignment: .leading, spacing: 6) {
                Text(controller.name)
                    .font(.title2)
                    .bold()
                Text(description)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            StatusBadge(text: controller.statusText, color: statusColors[controller.statusLevel] ?? .secondary)
        }
    }

    private var actionButtons: some View {
        HStack(spacing: 12) {
            Button {
                controller.start()
            } label: {
                Label("Start", systemImage: "play.fill")
            }
            .buttonStyle(.borderedProminent)
            .disabled(controller.isRunning)

            Button {
                controller.stop()
            } label: {
                Label("Stop", systemImage: "stop.fill")
            }
            .buttonStyle(.bordered)
            .disabled(!controller.isRunning)

            Button {
                controller.restart()
            } label: {
                Label("Restart", systemImage: "arrow.clockwise")
            }
            .buttonStyle(.bordered)
        }
    }

    private var footer: some View {
        HStack {
            if let exitCode = controller.lastExitCode {
                Text("Last exit status: \(exitCode)")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            } else {
                Text("No exits recorded yet.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Button("Clear Log") {
                controller.clearLog()
            }
            .buttonStyle(.bordered)
        }
    }
}

struct StatusBadge: View {
    var text: String
    var color: Color

    var body: some View {
        Text(text)
            .font(.footnote.weight(.semibold))
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(color.opacity(0.15))
            .foregroundStyle(color)
            .clipShape(Capsule())
            .accessibilityLabel("Status: \(text)")
    }
}

struct LogView: View {
    var text: String

    var body: some View {
        ScrollView {
            Text(text.isEmpty ? "Logs will appear here." : text)
                .font(.system(.caption, design: .monospaced))
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 4)
                .padding(.vertical, 8)
                .textSelection(.enabled)
        }
        .frame(minHeight: 160, maxHeight: 220)
        .background(Color(nsColor: .textBackgroundColor))
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }
}
