import SwiftUI
import UniformTypeIdentifiers

struct ContentView: View {
    @EnvironmentObject private var viewModel: DashboardViewModel
    @State private var showingDirectoryPicker = false

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            projectDirectorySection
            ServerMGM(controller: viewModel.devProcess)
            PlaywrightMGM(port: $viewModel.playwrightPort, controller: viewModel.playwrightProcess)
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

#Preview {
    ContentView()
        .environmentObject(DashboardViewModel())
        .frame(width: 900, height: 650)
}
