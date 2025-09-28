import SwiftUI
import UniformTypeIdentifiers

struct ContentView: View {
  @EnvironmentObject private var viewModel: DashboardViewModel
  @State private var showingDirectoryPicker = false
  @State private var draggingPlugin: PluginKind?

  var body: some View {
    GeometryReader { proxy in
      VStack(alignment: .leading, spacing: 20) {
        HStack {
          VStack(alignment: .leading, spacing: 12) {
            ProjectDirectoryCard(
              projectPath: $viewModel.projectPath,
              isCollapsed: $viewModel.isProjectDirectoryCollapsed,
              validationMessage: viewModel.pathValidationMessage,
              pathIsValid: viewModel.pathIsValid,
              onBrowse: { showingDirectoryPicker = true },
              onUseCurrentDirectory: { viewModel.useCurrentDirectory() }
            )
          }
          Spacer()
          DiscordRPCStatusIndicator(controller: viewModel.discordRPCController)
        }
        pluginList
      }
      .padding(24)
      .frame(width: proxy.size.width, height: proxy.size.height, alignment: .topLeading)
      .background(Color(nsColor: .windowBackgroundColor))
    }
    .frame(minWidth: 860, minHeight: 520)
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
}

extension ContentView {
  fileprivate var pluginList: some View {
    ScrollView {
      HStack(alignment: .top, spacing: 24) {
        ForEach(PluginColumn.allCases) { column in
          LazyVStack(spacing: 16) {
            ForEach(viewModel.pluginOrder.filter { $0.column == column }) { plugin in
              pluginRow(for: plugin)
                .opacity(draggingPlugin == plugin ? 0.7 : 1)
                .contentShape(Rectangle())
                .onDrag {
                  draggingPlugin = plugin
                  return NSItemProvider(object: plugin.rawValue as NSString)
                }
                .onDrop(
                  of: [UTType.text],
                  delegate: PluginDropDelegate(
                    target: plugin,
                    items: $viewModel.pluginOrder,
                    dragging: $draggingPlugin
                  )
                )
            }
          }
          .frame(maxWidth: .infinity, alignment: .topLeading)
        }
      }
      .frame(maxWidth: .infinity, alignment: .topLeading)
      .padding(.vertical, 8)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }

  @ViewBuilder
  fileprivate func pluginRow(for plugin: PluginKind) -> some View {
    if viewModel.isPluginDetached(plugin) {
      DetachedPluginPlaceholder(plugin: plugin)
    } else {
      PluginPanelView(
        plugin: plugin,
        mode: .embedded,
        onPopOut: { draggingPlugin = nil }
      )
    }
  }
}

private struct PluginDropDelegate: DropDelegate {
  let target: PluginKind
  @Binding var items: [PluginKind]
  @Binding var dragging: PluginKind?

  func validateDrop(info: DropInfo) -> Bool {
    info.hasItemsConforming(to: [UTType.text])
  }

  func dropEntered(info: DropInfo) {
    guard let dragging, dragging != target,
      let fromIndex = items.firstIndex(of: dragging),
      let toIndex = items.firstIndex(of: target)
    else { return }

    withAnimation(.easeInOut(duration: 0.15)) {
      items.move(
        fromOffsets: IndexSet(integer: fromIndex),
        toOffset: toIndex > fromIndex ? toIndex + 1 : toIndex
      )
    }
    self.dragging = dragging
  }

  func dropUpdated(info: DropInfo) -> DropProposal? {
    DropProposal(operation: .move)
  }

  func performDrop(info: DropInfo) -> Bool {
    dragging = nil
    return true
  }

  func dropExited(info: DropInfo) {
    // reset hover state when leaving current row
    if dragging == target {
      dragging = nil
    }
  }
}

#Preview {
  ContentView()
    .environmentObject(DashboardViewModel())
    .frame(width: 900, height: 650)
}
