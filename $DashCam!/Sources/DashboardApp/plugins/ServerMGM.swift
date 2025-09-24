import SwiftUI

struct ServerMGM: View {
    @ObservedObject var controller: ProcessController
    @Binding var isCollapsed: Bool
    @Binding var preferredHeight: CGFloat

    var body: some View {
        ProcessCard<EmptyView>(
            controller: controller,
            description: "Controls the local Vite dev server via npm run dev.",
            isCollapsed: $isCollapsed,
            preferredHeight: $preferredHeight
        )
        .layoutPriority(1)
    }
}
