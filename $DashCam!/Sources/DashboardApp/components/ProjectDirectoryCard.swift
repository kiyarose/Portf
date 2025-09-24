import SwiftUI

struct ProjectDirectoryCard: View {
    @Binding var projectPath: String
    @Binding var isCollapsed: Bool
    var validationMessage: String?
    var pathIsValid: Bool
    var onBrowse: () -> Void
    var onUseCurrentDirectory: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            header
            if isCollapsed {
                collapsedSummary
            } else {
                directoryForm
            }
        }
        .padding(20)
        .background(.regularMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        .animation(.easeInOut(duration: 0.2), value: isCollapsed)
    }

    private var header: some View {
        HStack(alignment: .center, spacing: 12) {
            collapseToggle
            VStack(alignment: .leading, spacing: 4) {
                Text("Project Directory")
                    .font(.title2)
                    .bold()
                if isCollapsed, pathIsValid {
                    Text(projectPath)
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                        .truncationMode(.middle)
                }
            }
            Spacer()
        }
    }

    private var directoryForm: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .center, spacing: 12) {
                TextField("Path to your project", text: $projectPath)
                    .textFieldStyle(.roundedBorder)
                    .disableAutocorrection(true)
                Button {
                    onBrowse()
                } label: {
                    Label("Browse…", systemImage: "folder")
                }
                .buttonStyle(.bordered)
                Button("Current Directory") {
                    onUseCurrentDirectory()
                }
                .buttonStyle(.borderedProminent)
                .tint(.green)
            }
            if let validationMessage {
                Text(validationMessage)
                    .font(.footnote)
                    .foregroundStyle(.red)
            }
        }
    }

    private var collapsedSummary: some View {
        HStack(alignment: .center, spacing: 12) {
            Text(projectPath.isEmpty ? "No directory selected" : projectPath)
                .font(.subheadline)
                .foregroundStyle(projectPath.isEmpty ? .secondary : .primary)
                .lineLimit(1)
                .truncationMode(.middle)
            Spacer()
            Button("Current Directory") {
                onUseCurrentDirectory()
            }
            .buttonStyle(.borderedProminent)
            .tint(.green)
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
        .accessibilityLabel(isCollapsed ? "Expand Project Directory" : "Collapse Project Directory")
    }
}
