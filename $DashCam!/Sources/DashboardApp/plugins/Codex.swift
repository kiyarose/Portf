import SwiftUI

struct CodexMGM: View {
    @ObservedObject var controller: CodexController
    @Binding var isCollapsed: Bool
    @Binding var preferredHeight: CGFloat

    @State private var promptDraft: String = ""
    @State private var showConnectionSettings = false
    @FocusState private var promptFocused: Bool
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    private var collapsedSummary: String? {
        guard isCollapsed else { return nil }
        return controller.collapsedSummary
    }

    private var canSend: Bool {
        !controller.isProcessing && controller.isCommandConfigured && !promptDraft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            header
            connectionControls
            promptComposer
            if !isCollapsed {
                transcript
                    .frame(minHeight: preferredHeight, idealHeight: preferredHeight, maxHeight: .infinity)
                    .animation(reduceMotion ? nil : .easeInOut(duration: 0.18), value: controller.entries.count)
                footer
                CardResizeHandle(height: $preferredHeight)
            }
        }
        .frame(maxWidth: .infinity, alignment: .topLeading)
        .padding(20)
        .background(.regularMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay {
            EdgeResizeOverlay(isCollapsed: isCollapsed, height: $preferredHeight)
        }
        .animation(reduceMotion ? nil : .easeInOut(duration: 0.2), value: isCollapsed)
    }

    private var header: some View {
        HStack(alignment: .top, spacing: 12) {
            HStack(alignment: .top, spacing: 12) {
                collapseToggle
                VStack(alignment: .leading, spacing: 6) {
                    Text("Codex")
                        .font(.title2)
                        .bold()
                    if let summary = collapsedSummary, !summary.isEmpty {
                        Text(summary)
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                            .lineLimit(1)
                    } else {
                        Text("Chat with Codex without leaving DashCam.")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            Spacer()
            statusBadge
        }
    }

    @ViewBuilder
    private var statusBadge: some View {
        switch controller.status {
        case .idle:
            let configured = controller.isCommandConfigured
            StatusBadge(text: configured ? "Ready" : "Command missing", color: configured ? .secondary : .red)
        case .sending:
            StatusBadge(text: "Thinking…", color: .orange)
        case .failed:
            StatusBadge(text: "Error", color: .red)
        }
    }

    private var connectionControls: some View {
        DisclosureGroup(isExpanded: $showConnectionSettings) {
            VStack(alignment: .leading, spacing: 12) {
                TextField("Command", text: $controller.commandPath)
                    .textFieldStyle(.roundedBorder)
                    .disabled(controller.isProcessing)

                TextField("Arguments (optional)", text: $controller.commandArguments)
                    .textFieldStyle(.roundedBorder)
                    .disabled(controller.isProcessing)

                Text("Arguments are split using shell-style rules. Wrap paths or phrases in quotes when needed.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)

                Text("DashCam streams the full conversation to the command via standard input.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)

                Toggle(isOn: $controller.includeProjectContext) {
                    Text("Include project context in prompts")
                }
                .disabled(controller.projectSummary == nil)

                if let summary = controller.projectSummary {
                    Text("Working directory: \(summary)")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                } else {
                    Text("Select a project directory to run the command inside your project root.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            }
            .padding(14)
            .background(Color.secondary.opacity(0.08))
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        } label: {
            Label("Codex command", systemImage: "terminal")
                .font(.subheadline.weight(.semibold))
        }
        .tint(.accentColor)
    }

    private var promptComposer: some View {
        VStack(alignment: .leading, spacing: 10) {
            if isCollapsed {
                TextField("Ask Codex…", text: $promptDraft, axis: .vertical)
                    .lineLimit(1...3)
                    .textFieldStyle(.roundedBorder)
                    .focused($promptFocused)
                    .disabled(!controller.isCommandConfigured || controller.isProcessing)
                    .onSubmit { sendPrompt() }
            } else {
                ZStack(alignment: .topLeading) {
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .fill(Color.secondary.opacity(0.08))
                    TextEditor(text: $promptDraft)
                        .scrollContentBackground(.hidden)
                        .padding(14)
                        .focused($promptFocused)
                        .frame(minHeight: 140, idealHeight: 160)
                        .disabled(!controller.isCommandConfigured || controller.isProcessing)
                    if promptDraft.isEmpty {
                        Text("Ask Codex for help with code or workflows…")
                            .font(.callout)
                            .foregroundStyle(.secondary)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 18)
                    }
                }
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            }

            HStack(spacing: 12) {
                Button {
                    sendPrompt()
                } label: {
                    Label("Send", systemImage: "paperplane.fill")
                }
                .buttonStyle(.borderedProminent)
                .disabled(!canSend)

                Button("Clear Draft") {
                    promptDraft = ""
                }
                .buttonStyle(.bordered)
                .disabled(promptDraft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
            .controlSize(isCollapsed ? .small : .regular)
        }
    }

    private var transcript: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 12) {
                    ForEach(controller.entries) { entry in
                        CodexTranscriptRow(entry: entry)
                            .id(entry.id)
                    }
                }
                .padding(.vertical, 8)
                .padding(.horizontal, 6)
            }
            .background(Color(nsColor: .textBackgroundColor))
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
            .onChange(of: controller.entries.last?.id) { id in
                guard let id else { return }
                let animation = reduceMotion ? Animation.linear(duration: 0.01) : .easeInOut(duration: 0.2)
                withAnimation(animation) {
                    proxy.scrollTo(id, anchor: .bottom)
                }
            }
        }
    }

    private var footer: some View {
        HStack {
            footerMessage
                .font(.footnote)
                .foregroundStyle(.secondary)
            Spacer()
            Button("Clear Transcript") {
                controller.clearHistory()
            }
            .buttonStyle(.bordered)
            .disabled(controller.entries.allSatisfy { $0.role == .info } || controller.isProcessing)
        }
    }

    private var footerMessage: Text {
        switch controller.status {
        case .idle:
            if controller.isCommandConfigured {
                return Text("Ready for your next prompt.")
            }
            return Text("Configure the Codex command to start chatting.")
        case .sending:
            return Text("Waiting for Codex…")
        case let .failed(message):
            return Text(message)
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
                        .strokeBorder(Color.secondary.opacity(0.18))
                )
        }
        .buttonStyle(.plain)
        .accessibilityLabel(isCollapsed ? "Expand Codex" : "Collapse Codex")
    }

    private func sendPrompt() {
        guard canSend else { return }
        let text = promptDraft
        controller.sendPrompt(text)
        promptDraft = ""
        if isCollapsed {
            promptFocused = false
        }
    }
}

private struct CodexTranscriptRow: View {
    let entry: CodexController.Entry

    var body: some View {
        switch entry.role {
        case .user:
            HStack(alignment: .top) {
                Spacer(minLength: 60)
                bubble(title: "You", icon: "person.fill", background: Color.accentColor.opacity(0.16), textColor: .accentColor, alignment: .trailing)
            }
            .transition(.move(edge: .trailing).combined(with: .opacity))
        case .assistant:
            HStack(alignment: .top) {
                bubble(title: "Codex", icon: "sparkles", background: Color.primary.opacity(0.05), textColor: .primary, alignment: .leading)
                Spacer(minLength: 60)
            }
            .transition(.move(edge: .leading).combined(with: .opacity))
        case .info:
            HStack(alignment: .top, spacing: 8) {
                Image(systemName: "info.circle")
                    .foregroundStyle(.secondary)
                Text(entry.text)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                Spacer()
            }
            .transition(.opacity)
        case .error:
            HStack(alignment: .top, spacing: 8) {
                Image(systemName: "exclamationmark.triangle.fill")
                    .foregroundStyle(.red)
                Text(entry.text)
                    .font(.footnote)
                    .foregroundStyle(.red)
                    .textSelection(.enabled)
                Spacer()
            }
            .transition(.opacity)
        }
    }

    @ViewBuilder
    private func bubble(title: String, icon: String, background: Color, textColor: Color, alignment: HorizontalAlignment) -> some View {
        VStack(alignment: alignment, spacing: 6) {
            Label(title, systemImage: icon)
                .labelStyle(.titleAndIcon)
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)
            formattedText
                .font(.body)
                .foregroundStyle(textColor)
                .frame(maxWidth: 360, alignment: alignment == .trailing ? .trailing : .leading)
                .textSelection(.enabled)
        }
        .padding(16)
        .background(background)
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
    }

    private var formattedText: Text {
        if let attributed = try? AttributedString(markdown: entry.text) {
            return Text(attributed)
        }
        return Text(entry.text)
    }
}

#Preview {
    CodexMGM(
        controller: CodexController(),
        isCollapsed: .constant(false),
        preferredHeight: .constant(220)
    )
    .frame(width: 420)
    .padding()
}
