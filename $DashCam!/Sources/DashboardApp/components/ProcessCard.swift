import SwiftUI

struct ProcessCard<ExtraContent: View>: View {
    @ObservedObject var controller: ProcessController
    @Binding var isCollapsed: Bool
    @Binding var preferredHeight: CGFloat
    var description: String
    var extraContent: ExtraContent
    private var collapsedLogLine: String? {
        guard isCollapsed else { return nil }
        let trimmed = controller.log.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return nil }
        guard let firstLine = trimmed.split(whereSeparator: { $0.isNewline }).first else {
            return nil
        }
        let candidate = firstLine.trimmingCharacters(in: .whitespaces)
        return candidate.isEmpty ? nil : String(candidate.prefix(120))
    }
    private let statusColors: [ProcessController.Level: Color] = [
        .neutral: .secondary,
        .success: .green,
        .warning: .orange,
        .error: .red
    ]

    init(
        controller: ProcessController,
        description: String,
        isCollapsed: Binding<Bool>,
        preferredHeight: Binding<CGFloat>,
        @ViewBuilder extraContent: () -> ExtraContent
    ) {
        self.controller = controller
        self._isCollapsed = isCollapsed
        self._preferredHeight = preferredHeight
        self.description = description
        self.extraContent = extraContent()
    }

    init(
        controller: ProcessController,
        description: String,
        isCollapsed: Binding<Bool>,
        preferredHeight: Binding<CGFloat>
    ) where ExtraContent == EmptyView {
        self.controller = controller
        self._isCollapsed = isCollapsed
        self._preferredHeight = preferredHeight
        self.description = description
        self.extraContent = EmptyView()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            header
            actionButtons(compact: isCollapsed)
            if !isCollapsed {
                extraContent
                LogView(text: controller.log)
                    .frame(minHeight: preferredHeight, idealHeight: preferredHeight, maxHeight: .infinity)
                    .animation(.easeInOut(duration: 0.15), value: preferredHeight)
                footer
                CardResizeHandle(height: $preferredHeight)
            }
        }
        .frame(maxWidth: .infinity, alignment: .topLeading)
        .frame(maxHeight: isCollapsed ? nil : .infinity, alignment: .topLeading)
        .padding(20)
        .background(.regularMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        .animation(.easeInOut(duration: 0.2), value: isCollapsed)
        .layoutPriority(1)
        .overlay {
            EdgeResizeOverlay(
                isCollapsed: isCollapsed,
                height: $preferredHeight
            )
        }
    }

    private var header: some View {
        HStack(alignment: .top) {
            HStack(alignment: .top, spacing: 12) {
                collapseToggle
                VStack(alignment: .leading, spacing: 6) {
                    Text(controller.name)
                        .font(.title2)
                        .bold()
                    if let collapsedLogLine {
                        Text(collapsedLogLine)
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                            .lineLimit(1)
                    } else {
                        Text(description)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            Spacer()
            StatusBadge(text: controller.statusText, color: statusColors[controller.statusLevel] ?? .secondary)
        }
    }

    private var collapseToggle: some View {
        Button {
            withAnimation(.easeInOut(duration: 0.2)) {
                isCollapsed.toggle()
            }
        } label: {
            Image(systemName: isCollapsed ? "chevron.down" : "chevron.up")
                .font(.body.weight(.semibold))
                .frame(width: 28, height: 28)
                .background(Color.secondary.opacity(0.12))
                .foregroundStyle(.primary)
                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                        .strokeBorder(Color.secondary.opacity(0.2))
                )
        }
        .buttonStyle(.plain)
        .accessibilityLabel(isCollapsed ? "Expand \(controller.name)" : "Collapse \(controller.name)")
    }

    private func actionButtons(compact: Bool) -> some View {
        HStack(spacing: compact ? 8 : 12) {
            Button {
                controller.start()
            } label: {
                Label("Start", systemImage: "play.fill")
            }
            .buttonStyle(.borderedProminent)
            .controlSize(compact ? .small : .regular)
            .disabled(controller.isRunning)

            Button {
                controller.stop()
            } label: {
                Label("Stop", systemImage: "stop.fill")
            }
            .buttonStyle(.bordered)
            .controlSize(compact ? .small : .regular)
            .disabled(!controller.isRunning)

            Button {
                controller.restart()
            } label: {
                Label("Restart", systemImage: "arrow.clockwise")
            }
            .buttonStyle(.bordered)
            .controlSize(compact ? .small : .regular)
        }
        .padding(.top, compact ? 0 : 0)
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
        .background(Color(nsColor: .textBackgroundColor))
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }
}
