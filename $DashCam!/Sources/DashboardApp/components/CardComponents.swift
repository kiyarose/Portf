import SwiftUI

enum CardMetrics {
  static let heightRange: ClosedRange<CGFloat> = 120...420
}

struct CardResizeHandle: View {
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

struct EdgeResizeOverlay: View {
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
        height = min(
          max(proposed, CardMetrics.heightRange.lowerBound), CardMetrics.heightRange.upperBound)
        activeEdge = edge
      }
      .onEnded { _ in
        baseline = nil
        activeEdge = nil
      }
  }
}

struct DiscordRPCStatusIndicator: View {
  @ObservedObject var controller: DiscordRPCController
  
  var body: some View {
    HStack(spacing: 6) {
      Image(systemName: discordIcon)
        .foregroundStyle(statusColor)
        .font(.caption.weight(.medium))
      
      Text(statusText)
        .font(.caption2)
        .foregroundStyle(.secondary)
      
      if controller.isEnabled {
        Toggle("", isOn: $controller.isEnabled)
          .toggleStyle(.switch)
          .controlSize(.mini)
      }
    }
    .padding(.horizontal, 8)
    .padding(.vertical, 4)
    .background(
      RoundedRectangle(cornerRadius: 6, style: .continuous)
        .fill(.regularMaterial.opacity(0.8))
    )
  }
  
  private var discordIcon: String {
    switch controller.status {
    case .connected:
      return "dot.radiowaves.up.forward"
    case .connecting:
      return "dot.radiowaves.up.forward"
    case .disconnected, .failed:
      return "dot.radiowaves.up.forward"
    }
  }
  
  private var statusColor: Color {
    switch controller.status {
    case .connected:
      return .green
    case .connecting:
      return .orange
    case .disconnected:
      return .secondary
    case .failed:
      return .red
    }
  }
  
  private var statusText: String {
    switch controller.status {
    case .connected:
      return "Discord RPC"
    case .connecting:
      return "Connecting..."
    case .disconnected:
      return "Disconnected"
    case .failed(let message):
      return "Failed"
    }
  }
}
