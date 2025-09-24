import SwiftUI

struct ServerMGM: View {
    @ObservedObject var controller: ProcessController

    var body: some View {
        ProcessCard(
            controller: controller,
            description: "Controls the local Vite dev server via npm run dev."
        )
    }
}
