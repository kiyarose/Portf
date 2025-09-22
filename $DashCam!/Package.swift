// swift-tools-version: 5.9

import PackageDescription

let package = Package(
    name: "DashCam",
    defaultLocalization: "en",
    platforms: [
        .macOS(.v13)
    ],
    products: [
        .executable(
            name: "DashCam",
            targets: ["DashboardApp"]
        )
    ],
    dependencies: [],
    targets: [
        .executableTarget(
            name: "DashboardApp",
            path: "Sources/DashboardApp"
        )
    ]
)
