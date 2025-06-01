[![GitHub all releases](https://img.shields.io/github/downloads/gnsc4/Torn-Widget/total)](https://github.com/gnsc4/Torn-Widget/releases) [![Release Tauri App](https://github.com/gnsc4/Torn-Widget/actions/workflows/main.yml/badge.svg?branch=main)](https://github.com/gnsc4/Torn-Widget/actions/workflows/main.yml)

# Torn Status Widget

A sleek, real-time desktop widget to monitor your Torn City status. Stay updated on energy, nerve, happiness, cooldowns, refills, travel, races, and notifications directly on your desktop. Built with Tauri v2.

## Key Features

* **Real-time Status Monitoring:**
    * Life (with visual health bar)
    * Energy (with timer to full)
    * Nerve (with timer to full)
    * Happiness (with timer to full)
    * Travel Status (destination, time remaining, arrival flash)
    * Latest Race Status (track info, time to start/end, completion flash)
    * New Day Countdown Timer
* **Cooldown Timers:**
    * Booster (with timer, flashing when ready)
    * Medical (with timer, flashing when ready)
    * Drug (with timer, flashing when ready)
* **Refill Status:**
    * Energy Refill (ready/used, flashes near new day if ready)
    * Nerve Refill (ready/used, flashes near new day if ready)
    * Token Refill (ready/used, flashes near new day if ready)
* **Notifications:**
    * New Messages (count and icon indicator)
    * New Events (count and icon indicator)
* **Customizable Interface & Experience:**
    * **Minimize Widget:** Shrink to a compact icon.
    * **Always on Top:** Keep the widget visible over other windows.
    * **Transparent Background:** (Platform-dependent, vibrancy effect on macOS).
    * **Tray Icon:**
        * Show/Hide widget with a left-click.
        * Menu with "Show Widget" and "Quit" options.
    * **Item Link Preferences:** Choose whether item links (Drugs, Boosters, Medical, Energy/Nerve Refills) point to your personal items or faction armoury.
* **Autostart Option:** Configure the widget to launch automatically when your system boots.
* **Automatic Updates:** The widget checks for new versions on GitHub and notifies you.
* **Secure API Key Integration:** Connects to your Torn account using your API key, stored locally.
* **Terms of Service:** Requires acceptance of Terms of Service before use.

## Terms of Service

Before using the Torn Status Widget, you are required to accept the [Terms of Service](https://gnsc4.org/TornWidgetToS.html). The ToS screen will be presented on the first run or if the API key needs to be (re)configured.

## Installation

You can download the latest version (v1.0.42) of the Torn Status Widget for your operating system from the [**Releases page**](https://github.com/gnsc4/Torn-Widget/releases/) on GitHub.

### Windows

1.  From the [latest release assets](https://github.com/gnsc4/Torn-Widget/releases/), download either:
    * `torn-status-widget_0.1.0_x64_en-US.msi` (Microsoft Installer)
    * `torn-status-widget_0.1.0_x64-setup.exe` (NSIS Installer)
2.  **For the `.msi` file:**
    * Double-click the downloaded `.msi` file.
    * Follow the on-screen instructions in the installation wizard.
3.  **For the `.exe` file:**
    * Double-click the downloaded `.exe` file.
    * Follow the on-screen instructions.

### macOS (Apple Silicon)

1.  From the [latest release assets](https://github.com/gnsc4/Torn-Widget/releases/), download either:
    * `torn-status-widget_0.1.0_aarch64.dmg`
    * `torn-status-widget_aarch64.app.tar.gz`
2.  **For the `.dmg` file:**
    * Double-click the downloaded `.dmg` file to mount it.
    * Drag the `torn-status-widget.app` icon into your `Applications` folder.
3.  **For the `.app.tar.gz` file:**
    * Extract the `torn-status-widget.app` file from the downloaded `.tar.gz` archive.
    * Drag the extracted `torn-status-widget.app` icon into your `Applications` folder.
4.  You can now launch the application from your `Applications` folder or Launchpad. (Note: On first launch, you may need to right-click and select "Open" if Gatekeeper shows a warning).
    *Note: These files are for Apple Silicon (aarch64) Macs. If you have an Intel-based Mac, these may run via Rosetta 2, or you may need to await a specific x64 build if one becomes available.*

### Linux

1.  From the [latest release assets](https://github.com/gnsc4/Torn-Widget/releases/), download the appropriate installer for your distribution:
    * `torn-status-widget_0.1.0_amd64.AppImage` (Recommended for most distributions)
    * `torn-status-widget_0.1.0_amd64.deb` (For Debian/Ubuntu-based systems)
    * `torn-status-widget-0.1.0-1.x86_64.rpm` (For Fedora/openSUSE-based systems)
2.  **For `.AppImage` files:**
    * Make the file executable:
        ```bash
        chmod +x torn-status-widget_0.1.0_amd64.AppImage
        ```
    * Run the application:
        ```bash
        ./torn-status-widget_0.1.0_amd64.AppImage
        ```
    * You might consider using a tool like "AppImageLauncher" to integrate it into your system.
3.  **For `.deb` files:**
    * You can usually install it by double-clicking the file or using the command line:
        ```bash
        sudo dpkg -i torn-status-widget_0.1.0_amd64.deb
        sudo apt-get install -f # To install any missing dependencies
        ```
4.  **For `.rpm` files:**
    * Install using your system's package manager:
        ```bash
        sudo rpm -i torn-status-widget-0.1.0-1.x86_64.rpm
        # Or, for systems using dnf (like Fedora):
        # sudo dnf install torn-status-widget-0.1.0-1.x86_64.rpm
        ```

## Usage

1.  **Launch the Application:**
    * **Windows:** Find "Torn Status Widget" in your Start Menu or use the desktop shortcut.
    * **macOS:** Open from your `Applications` folder.
    * **Linux:** Launch from your applications menu or by running the AppImage/installed application.

2.  **Initial Setup (API Key & ToS):**
    * On first launch, or if no API key is configured, you'll be prompted to enter your Torn API Key. Obtain this from Torn City: [Preferences -> API Key](https://www.torn.com/preferences.php#tab=api).
    * You must also check the box to accept the [Terms of Service](https://gnsc4.org/TornWidgetToS.html).
    * Enter your key, accept the ToS, and click "Save".
    * You can also toggle the "Start widget on system boot" option during this initial setup.

3.  **Interacting with the Widget:**
    * **Header Buttons:**
        * **⚙️ (Settings):** Opens the settings panel.
        * **−/□ (Minimize/Maximize):** Toggles between full and compact icon view.
        * **× (Close):** Closes the widget. (It can be reopened via the tray icon).
    * **Dragging:** Click and drag the header area to move the widget.
    * **Links:** Most status items and notification icons are clickable, taking you to relevant Torn.com pages.
    * **Tooltips:** Hover over timers (e.g., energy, cooldowns) to see detailed end times.
    * **Tray Icon (System Tray):**
        * **Left-click:** Toggles the widget's visibility (Show/Hide).
        * **Right-click (or single click on some systems):** Opens a menu to "Show Widget" or "Quit" the application entirely.

4.  **Settings Panel:**
    * **API Key Management:**
        * Enter a new API key and click "Save Key".
        * Click "Clear Key" to remove the saved API key (this will require re-setup).
    * **Item Link Preferences:** For Drugs, Boosters, Medical items, Energy Refill, and Nerve Refill, toggle the destination of their respective links between your "Personal" items page or your "Faction" armoury page.
    * **Autostart:** Check/uncheck "Start widget on system boot".
    * **Always on Top:** Check/uncheck to keep the widget above other windows.
    * Click "Close" to exit the settings panel.

5.  **Automatic Updates:**
    * The widget automatically checks for new versions from GitHub.
    * If an update is available, a notification will appear at the bottom of the widget with a link to the releases page.

## Development

Built with Tauri v2. If you wish to contribute or run the application from source:

### Prerequisites

* [Node.js](https://nodejs.org/) (LTS recommended, includes npm)
* [Rust](https://www.rust-lang.org/tools/install) (stable toolchain)
* [Tauri CLI v2 prerequisites](https://v2.tauri.app/start/prerequisites/) for your specific OS (WebView2 for Windows, WebKitGTK for Linux, Xcode Command Line Tools for macOS).
* Tauri CLI v2:
    ```bash
    npm install -g @tauri-apps/cli@next
    # or
    yarn global add @tauri-apps/cli@next
    # or
    cargo install tauri-cli --version "^2.0.0-beta" 
    ```
    (Ensure you are using a Tauri CLI version compatible with `@tauri-apps/api@^2.5.0`, e.g., `@tauri-apps/cli@^2.5.0` or the latest beta if specified by the project.)

### Running in Development Mode

1.  Clone the repository:
    ```bash
    git clone [https://github.com/gnsc4/Torn-Widget.git](https://github.com/gnsc4/Torn-Widget.git)
    cd Torn-Widget/torn-status-widget 
    ```
2.  Install frontend dependencies:
    ```bash
    npm install
    ```
3.  Run the development server and the Tauri app:
    ```bash
    npm run tauri dev
    ```
    This uses Vite for the frontend and Tauri for the application shell.

### Building for Production

1.  Install frontend dependencies (if not already done):
    ```bash
    npm install
    ```
2.  Build the Tauri application:
    ```bash
    npm run tauri build
    ```
    This will generate installers/bundles in `torn-status-widget/src-tauri/target/release/bundle/`.

### Generating Signer Keys (Optional for Contributors)
If you need to generate your own update signing keys (the project already has one for its official releases):
```bash
npm run generate-keys
```
Follow the prompts. You'll need to update the `updater.pubkey` in `src-tauri/tauri.conf.json` if you use your own key for a fork.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
