import SwiftUI

struct PlaywrightMGM: View {
    @Binding var port: Int
    @ObservedObject var controller: ProcessController
    @Binding var isCollapsed: Bool
    @Binding var preferredHeight: CGFloat

    var body: some View {
        ProcessCard(
            controller: controller,
            description: "Launches Playwright codegen against your selected port. Use this when you need to record new flows.",
            isCollapsed: $isCollapsed,
            preferredHeight: $preferredHeight
        ) {
            PlaywrightPortControls(port: $port, controller: controller)
        }
        .layoutPriority(1)
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
            Text("Playwright codegen will launch at http://localhost:\(port).")
                .font(.footnote)
                .foregroundStyle(.secondary)
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
