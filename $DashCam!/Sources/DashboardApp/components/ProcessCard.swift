import SwiftUI

private enum CardMetrics {
    static let heightRange: ClosedRange<CGFloat> = 160...420
}

struct ProcessCard<ExtraContent: View>: View {
    @ObservedObject var controller: ProcessController
    @Binding var isCollapsed: Bool
    @Binding var preferredHeight: CGFloat
    var description: String
    var extraContent: ExtraContent
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
                    Text(description)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
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

private struct CardResizeHandle: View {
    @Binding var height: CGFloat
    @State private var baseline: CGFloat?

    var body: some View {
        HStack {
            Spacer()
            Capsule()
                .fill(Color.secondary.opacity(0.35))
                .frame(width: 80, height: 6)
                .overlay(
                    Capsule()
                        .stroke(Color.secondary.opacity(0.5), lineWidth: 0.5)
                )
                .padding(.vertical, 6)
                .gesture(dragGesture)
                .accessibilityLabel("Resize panel height")
            Spacer()
        }
        .padding(.top, 6)
    }

    private var dragGesture: some Gesture {
        DragGesture(minimumDistance: 0)
            .onChanged { value in
                if baseline == nil {
                    baseline = height
                }
                guard let baseline else { return }
                let proposed = baseline - value.translation.height
                height = clampHeight(proposed)
            }
            .onEnded { _ in
                baseline = nil
            }
    }

    private func clampHeight(_ value: CGFloat) -> CGFloat {
        min(max(value, CardMetrics.heightRange.lowerBound), CardMetrics.heightRange.upperBound)
    }
}

private struct EdgeResizeOverlay: View {
    var isCollapsed: Bool
    @Binding var height: CGFloat
    @State private var baseline: CGFloat?
    @State private var activeEdge: Edge?

    private enum Edge {
        case top
        case bottom
    }

    var body: some View {
        GeometryReader { _ in
            if isCollapsed {
                Color.clear
            } else {
                VStack {
                    edgeHandle(.top)
                    Spacer(minLength: 0)
                    edgeHandle(.bottom)
                }
                .background(Color.clear)
            }
        }
        .allowsHitTesting(!isCollapsed)
    }

    private func edgeHandle(_ edge: Edge) -> some View {
        HStack {
            Spacer()
            Capsule()
                .fill(Color.secondary.opacity(activeEdge == edge ? 0.45 : 0.15))
                .frame(width: 80, height: 5)
                .padding(.vertical, 4)
                .opacity(activeEdge == edge ? 1 : 0.7)
                .contentShape(Rectangle())
                .gesture(dragGesture(for: edge))
            Spacer()
        }
        .frame(height: 16)
    }

    private func dragGesture(for edge: Edge) -> some Gesture {
        DragGesture(minimumDistance: 0)
            .onChanged { value in
                if baseline == nil {
                    baseline = height
                }
                guard let baseline else { return }
                let translation = value.translation.height
                let proposed: CGFloat
                switch edge {
                case .top:
                    proposed = baseline - translation
                case .bottom:
                    proposed = baseline + translation
                }
                height = min(max(proposed, CardMetrics.heightRange.lowerBound), CardMetrics.heightRange.upperBound)
                activeEdge = edge
            }
            .onEnded { _ in
                baseline = nil
                activeEdge = nil
            }
    }
}
