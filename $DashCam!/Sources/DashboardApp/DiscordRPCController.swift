import AppKit
import Foundation

@MainActor
final class DiscordRPCController: ObservableObject {
  enum Status: Equatable {
    case disconnected
    case connecting
    case connected
    case failed(message: String)
  }

  struct Activity {
    let details: String?
    let state: String?
    let largeImageKey: String?
    let largeImageText: String?
    let smallImageKey: String?
    let smallImageText: String?
    let startTimestamp: Int64?
  }

  @Published private(set) var status: Status = .disconnected
  @Published var isEnabled: Bool = true {
    didSet {
      if isEnabled {
        connect()
      } else {
        disconnect()
      }
    }
  }

  private let applicationId = "1421775360176951336"
  private var connectTimer: Timer?
  private var updateTimer: Timer?
  private let ipcPath: String

  init() {
    self.ipcPath = "/tmp/discord-ipc-0"

    // Attempt to connect when initialized if enabled
    if isEnabled {
      connect()
    }
  }

  deinit {
    Task { await disconnect() }
  }

  func connect() {
    guard isEnabled, status != .connected, status != .connecting else { return }

    status = .connecting

    // Set up a timer to periodically try connecting
    connectTimer?.invalidate()
    connectTimer = Timer.scheduledTimer(withTimeInterval: 3.0, repeats: true) { [weak self] _ in
      Task { await self?.attemptConnection() }
    }

    // Try immediate connection
    attemptConnection()
  }

  func disconnect() {
    status = .disconnected
    connectTimer?.invalidate()
    updateTimer?.invalidate()
    connectTimer = nil
    updateTimer = nil
  }

  func updateActivity(_ activity: Activity) {
    guard status == .connected else { return }

    let payload = createActivityPayload(activity)
    sendRPCCommand(payload)
  }

  func clearActivity() {
    guard status == .connected else { return }

    let payload: [String: Any] = [
      "cmd": "SET_ACTIVITY",
      "args": [
        "pid": ProcessInfo.processInfo.processIdentifier,
        "activity": NSNull(),
      ],
      "nonce": UUID().uuidString,
    ]

    sendRPCCommand(payload)
  }

  private func attemptConnection() {
    guard FileManager.default.fileExists(atPath: ipcPath) else {
      if status == .connecting {
        // Discord is not running, but keep trying
        return
      }
      status = .failed(message: "Discord not running")
      return
    }

    // Create handshake payload
    let handshake: [String: Any] = [
      "v": 1,
      "client_id": applicationId,
    ]

    guard let handshakeData = try? JSONSerialization.data(withJSONObject: handshake),
      sendHandshake(handshakeData)
    else {
      status = .failed(message: "Failed to connect to Discord")
      return
    }

    status = .connected
    connectTimer?.invalidate()
    connectTimer = nil

    // Set up periodic updates
    setupUpdateTimer()
  }

  private func setupUpdateTimer() {
    updateTimer?.invalidate()
    updateTimer = Timer.scheduledTimer(withTimeInterval: 15.0, repeats: true) { [weak self] _ in
      Task { await self?.sendHeartbeat() }
    }
  }

  private func sendHandshake(_ data: Data) -> Bool {
    do {
      let fileHandle = try FileHandle(forWritingTo: URL(fileURLWithPath: ipcPath))
      defer { fileHandle.closeFile() }

      // Discord RPC protocol: opcode (4 bytes) + length (4 bytes) + data
      var header = Data()
      let opcode: UInt32 = 0  // Handshake opcode
      let length: UInt32 = UInt32(data.count)

      var opcodeLE = opcode.littleEndian
      var lengthLE = length.littleEndian
      header.append(Data(bytes: &opcodeLE, count: 4))
      header.append(Data(bytes: &lengthLE, count: 4))

      fileHandle.write(header)
      fileHandle.write(data)

      return true
    } catch {
      return false
    }
  }

  private func sendRPCCommand(_ payload: [String: Any]) {
    guard let data = try? JSONSerialization.data(withJSONObject: payload) else { return }

    do {
      let fileHandle = try FileHandle(forWritingTo: URL(fileURLWithPath: ipcPath))
      defer { fileHandle.closeFile() }

      // Discord RPC protocol: opcode (4 bytes) + length (4 bytes) + data
      var header = Data()
      let opcode: UInt32 = 1  // Frame opcode
      let length: UInt32 = UInt32(data.count)

      var opcodeLE = opcode.littleEndian
      var lengthLE = length.littleEndian
      header.append(Data(bytes: &opcodeLE, count: 4))
      header.append(Data(bytes: &lengthLE, count: 4))

      fileHandle.write(header)
      fileHandle.write(data)
    } catch {
      status = .failed(message: "Failed to send RPC command")
    }
  }

  private func sendHeartbeat() {
    let payload: [String: Any] = [
      "cmd": "PING",
      "args": [:],
      "nonce": UUID().uuidString,
    ]

    sendRPCCommand(payload)
  }

  private func createActivityPayload(_ activity: Activity) -> [String: Any] {
    var activityData: [String: Any] = [:]

    if let details = activity.details {
      activityData["details"] = details
    }

    if let state = activity.state {
      activityData["state"] = state
    }

    if let startTimestamp = activity.startTimestamp {
      activityData["timestamps"] = ["start": startTimestamp]
    }

    var assets: [String: Any] = [:]
    if let largeImageKey = activity.largeImageKey {
      assets["large_image"] = largeImageKey
    }
    if let largeImageText = activity.largeImageText {
      assets["large_text"] = largeImageText
    }
    if let smallImageKey = activity.smallImageKey {
      assets["small_image"] = smallImageKey
    }
    if let smallImageText = activity.smallImageText {
      assets["small_text"] = smallImageText
    }

    if !assets.isEmpty {
      activityData["assets"] = assets
    }

    return [
      "cmd": "SET_ACTIVITY",
      "args": [
        "pid": ProcessInfo.processInfo.processIdentifier,
        "activity": activityData,
      ],
      "nonce": UUID().uuidString,
    ]
  }
}
