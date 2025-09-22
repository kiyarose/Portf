# Dev Workflow Dashboard (macOS)

A lightweight SwiftUI control panel that lets you start, stop, and restart the two long-running tasks used while developing this project:

- `npm run dev`
- `npx playwright codegen http://localhost:<port>`

The app surfaces the latest log output for each process, allows clearing logs, and provides a quick way to pick the project folder so both commands run in the right directory.

## Requirements

- macOS 13 Ventura or newer
- Xcode 15 (or newer) with the Command Line Tools installed

## Getting Started

1. Open the `macos-dashboard` folder in Xcode (`open macos-dashboard/Package.swift`).
2. Choose the _DashboardApp_ scheme and press **⌘R** to build and run.
3. Confirm the "Project Directory" points at your repo (defaults to `~/Documents/GitStuff/Portf`).
4. Use the Start/Stop/Restart controls for either task. The status chips and logs update in real time.
5. Adjust the Playwright port if your dev server is running on a different localhost port.

> Tip: Use the **Stop All Tasks** menu item under the app menu (or the shortcut **⇧⌘.**) to terminate everything quickly.

## Building from Terminal

You can build or run the app from Terminal with Swift Package Manager:

```bash
cd macos-dashboard
swift run
```

(If sandboxing prevents SPM from writing to its caches, re-run the command outside the restricted environment or from a regular Terminal session.)

## Project Layout

- `Package.swift` – Swift Package manifest.
- `Sources/DashboardApp` – SwiftUI app, view model, and process-management logic.

Feel free to customize the commands or add additional cards if you introduce new always-on tools.
