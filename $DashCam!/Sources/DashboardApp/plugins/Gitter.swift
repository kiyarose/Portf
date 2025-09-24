import SwiftUI

struct GitterMGM: View {
    @ObservedObject var controller: GitController
    @Binding var isCollapsed: Bool
    @Binding var preferredHeight: CGFloat
    var pathIsValid: Bool

    @State private var commitMessage: String = ""
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

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

    private var commitMessageIsValid: Bool {
        !commitMessage.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            header
            controls
            if !isCollapsed {
                LogView(text: controller.log)
                    .frame(minHeight: preferredHeight, idealHeight: preferredHeight, maxHeight: .infinity)
                    .animation(
                        reduceMotion ? nil : .easeInOut(duration: 0.15),
                        value: preferredHeight
                    )
                footer
                CardResizeHandle(height: $preferredHeight)
            }
        }
        .frame(maxWidth: .infinity, alignment: .topLeading)
        .frame(maxHeight: isCollapsed ? nil : .infinity, alignment: .topLeading)
        .padding(20)
        .background(.regularMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        .animation(reduceMotion ? nil : .easeInOut(duration: 0.2), value: isCollapsed)
        .overlay {
            EdgeResizeOverlay(isCollapsed: isCollapsed, height: $preferredHeight)
        }
    }

    private var header: some View {
        HStack(alignment: .top) {
            HStack(alignment: .top, spacing: 12) {
                collapseToggle
                VStack(alignment: .leading, spacing: 6) {
                    Text("Gitter")
                        .font(.title2)
                        .bold()
                    if let collapsedLogLine {
                        Text(collapsedLogLine)
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                            .lineLimit(1)
                    } else {
                        Text("Stage, commit, and sync with your remote repo.")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            Spacer()
            statusBadge
        }
    }

    private var controls: some View {
        VStack(alignment: .leading, spacing: 10) {
            TextField("Commit message", text: $commitMessage)
                .textFieldStyle(.roundedBorder)
                .disabled(controller.isBusy || !pathIsValid)
                .submitLabel(.done)
                .onSubmit {
                    if commitMessageIsValid {
                        push()
                    }
                }
            HStack(spacing: 12) {
                Button {
                    pull()
                } label: {
                    Label("Pull", systemImage: "arrow.down.circle")
                }
                .buttonStyle(.bordered)
                .disabled(controller.isBusy || !pathIsValid)

                Button {
                    push()
                } label: {
                    Label("Push", systemImage: "arrow.up.circle")
                }
                .buttonStyle(.borderedProminent)
                .disabled(controller.isBusy || !commitMessageIsValid || !pathIsValid)
            }
            .controlSize(isCollapsed ? .small : .regular)
            .animation(reduceMotion ? nil : .easeInOut(duration: 0.2), value: isCollapsed)
            if !pathIsValid {
                Text("Select a project directory to enable git commands.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private var footer: some View {
        HStack {
            if controller.isBusy {
                ProgressView()
                    .progressViewStyle(.circular)
                    .scaleEffect(0.7)
                Text("Working…")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            } else {
                Text("Ready")
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

    private var statusBadge: some View {
        Group {
            if controller.isBusy {
                StatusBadge(text: "Running", color: .orange)
            } else {
                StatusBadge(text: "Idle", color: .secondary)
            }
        }
    }

    private var collapseToggle: some View {
        Button {
            withAnimation(reduceMotion ? nil : .easeInOut(duration: 0.2)) {
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
        .accessibilityLabel(isCollapsed ? "Expand Gitter" : "Collapse Gitter")
    }

    private func pull() {
        controller.pull()
    }

    private func push() {
        let message = commitMessage.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !message.isEmpty else { return }
        commitMessage = message
        controller.push(commitMessage: message)
    }
}
