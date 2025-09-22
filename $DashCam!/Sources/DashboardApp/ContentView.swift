import SwiftUI
import UniformTypeIdentifiers

struct ContentView: View {
    @EnvironmentObject private var viewModel: DashboardViewModel
    @State private var showingDirectoryPicker = false

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            projectDirectorySection
            ProcessCard(controller: viewModel.devProcess, description: "Controls the local Vite dev server via npm run dev.")
            ProcessCard(
                controller: viewModel.playwrightProcess,
                description: "Launches Playwright codegen against your selected port. Use this when you need to record new flows."
            ) {
                PlaywrightPortControls(port: $viewModel.playwrightPort, controller: viewModel.playwrightProcess)
            }
            Spacer()
        }
        .padding(24)
        .frame(minWidth: 860, minHeight: 600)
        .background(Color(nsColor: .windowBackgroundColor))
        .fileImporter(
            isPresented: $showingDirectoryPicker,
            allowedContentTypes: [.folder],
            allowsMultipleSelection: false
        ) { result in
            switch result {
            case .success(let urls):
                if let url = urls.first {
                    viewModel.setProjectURL(url)
                }
            case .failure(let error):
                print("Failed to pick directory: \(error.localizedDescription)")
            }
        }
    }

    private var projectDirectorySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Project Directory")
                .font(.title3)
                .bold()
            HStack(alignment: .center, spacing: 12) {
                TextField("Path to your project", text: $viewModel.projectPath)
                    .textFieldStyle(.roundedBorder)
                    .disableAutocorrection(true)
                Button {
                    showingDirectoryPicker = true
                } label: {
                    Label("Browse…", systemImage: "folder")
                }
                .buttonStyle(.bordered)
            }
            if let message = viewModel.pathValidationMessage {
                Text(message)
                    .font(.footnote)
                    .foregroundStyle(.red)
            }
        }
        .padding(16)
        .background(.thinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
    }
}

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

            extraContent

            LogView(text: controller.log)

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
        .padding(20)
        .background(.regularMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
    }
}

private struct PlaywrightPortControls: View {
    @Binding var port: Int
    @ObservedObject var controller: ProcessController

    private let formatter: NumberFormatter = {
        let formatter = NumberFormatter()
        formatter.numberStyle = .none
        formatter.minimum = 1024
        formatter.maximum = 65535
        return formatter
    }()

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 12) {
                Stepper(value: $port, in: 1024...65535, step: 1) {
                    Text("Port: \(port)")
                        .font(.subheadline)
                        .accessibilityLabel("Port \(port)")
                }
                TextField("Port", value: $port, formatter: formatter)
                    .labelsHidden()
                    .frame(width: 80)
                    .textFieldStyle(.roundedBorder)
            }
            Text("Playwright codegen will launch at http://localhost:\(port).").font(.footnote).foregroundStyle(.secondary)
            if controller.isRunning {
                Text("Restart the session to apply the new port.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(12)
        .background(Color.secondary.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }
}

private struct StatusBadge: View {
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

private struct LogView: View {
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

#Preview {
    ContentView()
        .environmentObject(DashboardViewModel())
        .frame(width: 900, height: 650)
}
