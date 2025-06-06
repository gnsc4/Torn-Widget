[![GitHub all releases](https://img.shields.io/github/downloads/gnsc4/Torn-Widget/total)](https://github.com/gnsc4/Torn-Widget/releases) [![Release Tauri App](https://github.com/gnsc4/Torn-Widget/actions/workflows/main.yml/badge.svg?branch=main)](https://github.com/gnsc4/Torn-Widget/actions/workflows/main.yml)

# Torn Status Widget

A sleek, real-time desktop widget to monitor your Torn City status. Stay updated on energy, nerve, happiness, cooldowns, refills, travel, races, and notifications directly on your desktop. Built with Tauri.

## Key Features

* **Real-time Status Monitoring:**
    * Life (with visual health bar)
    * Energy (with timer to full)
    * Nerve (with timer to full)
    * Happiness (with timer to full)
    * Travel Status (destination, time remaining, arrival flash)
    * Latest Race Status (track info including track names, time to start/end, completion flash)
    * New Day Countdown Timer
* **Cooldown Timers:**
    * Booster (with timer, flashing when ready)
    * Medical (with timer, flashing when ready)
    * Drug (with timer, flashing when ready)
* **Refill Status:**
    * Energy Refill (ready/used, flashes near new day if ready)
    * Nerve Refill (ready/used, flashes near new day if ready)
    * Token Refill (ready/used, flashes near new day if ready)
* **Advanced Notifications:**
    * **System Notifications:** Desktop pop-up notifications for new messages, events, and various configurable in-game events (see Settings Panel).
    * **Voice Notifications:** Option to have notifications read aloud.
    * **In-Widget Indicators:**
        * New Messages (count and icon indicator)
        * New Events (count and icon indicator)
* **Customizable Interface & Experience:**
    * **Minimize Widget:** Shrink to a compact icon.
    * **Always on Top:** Keep the widget visible over other windows.
    * **Close to Tray:** Option to minimize the application to the system tray when the close button is clicked.
    * **Transparent Background:** (Platform-dependent, vibrancy effect on macOS).
    * **Tray Icon:**
        * Show/Hide widget with a left-click.
        * Right-click menu with "Show Widget" and "Quit" options.
    * **Item Link Preferences:** Choose whether item links (Drugs, Boosters, Medical, Energy/Nerve Refills) point to your personal items or faction armoury.
    * **UI Element Flashing:** Configurable flashing for various ready/full status labels (see Settings Panel).
    * **Informative Tooltips:** Hover over timers to see detailed end times or additional information.
* **Autostart Option:** Configure the widget to launch automatically when your system boots.
* **Automatic Updates:**
    * The widget checks for new versions on GitHub on startup (system dialog).
    * Periodic checks for updates every 15 minutes with an in-app notification.
* **Secure API Key Integration:** Connects to your Torn account using your API key, stored locally.
* **Terms of Service:** Requires acceptance of Terms of Service before use.

## Terms of Service

Before using the Torn Status Widget, you are required to accept the [Terms of Service](https://gnsc4.org/TornWidgetToS.html). The ToS screen will be presented on the first run or if the API key needs to be (re)configured.

## Installation

You can download the latest version of the Torn Status Widget for your operating system from the [**Releases page**](https://github.com/gnsc4/Torn-Widget/releases/) on GitHub.

### Windows

1.  From the [latest release assets](https://github.com/gnsc4/Torn-Widget/releases/), download either:
    * `torn-status-widget_x.y.z_x64_en-US.msi` (Microsoft Installer - replace x.y.z with the version number)
    * `torn-status-widget_x.y.z_x64-setup.exe` (NSIS Installer - replace x.y.z with the version number)
2.  **For the `.msi` file:**
    * Double-click the downloaded `.msi` file.
    * Follow the on-screen instructions in the installation wizard.
3.  **For the `.exe` file:**
    * Double-click the downloaded `.exe` file.
    * Follow the on-screen instructions.
    * You might see a Windows SmartScreen warning because the application is from an independent developer. Click "More info" and then "Run anyway" to proceed.

### macOS (Universal - Intel & Apple Silicon)

1.  From the [latest release assets](https://github.com/gnsc4/Torn-Widget/releases/), download the `.dmg` file (e.g., `torn-status-widget_x.y.z_universal.dmg` - replace x.y.z with the version number).
2.  Double-click the downloaded `.dmg` file to mount it.
3.  Drag the `torn-status-widget.app` icon into your `Applications` folder.
4.  **Important: Opening the app for the first time:**
    * Because the application is not signed with an Apple Developer ID, Gatekeeper (macOS security feature) will show a warning.
    * To open the app:
        1.  Locate `torn-status-widget.app` in your `Applications` folder.
        2.  **Right-click (or Control-click) the app icon.**
        3.  Select **"Open"** from the context menu.
        4.  A dialog will appear asking if you are sure you want to open it. Click **"Open"** again.
    * You should only need to do this the first time you launch the app. Subsequent launches can be done normally from the Applications folder or Launchpad.

### Linux

1.  From the [latest release assets](https://github.com/gnsc4/Torn-Widget/releases/), download the appropriate file for your system:
    * `torn-status-widget_x.y.z_amd64.AppImage` (Recommended for most distributions - replace x.y.z with the version number)
    * `torn-status-widget_x.y.z_amd64.deb` (For Debian/Ubuntu-based systems - replace x.y.z with the version number)
2.  **For `.AppImage` files (Recommended):**
    * This format is designed to run on most Linux distributions without installation.
    * Open your terminal and navigate to the directory where you downloaded the AppImage.
    * Make the file executable:
        ```bash
        chmod +x torn-status-widget_x.y.z_amd64.AppImage
        ```
    * Run the application:
        ```bash
        ./torn-status-widget_x.y.z_amd64.AppImage
        ```
    * **Note on `libfuse2`:** Some systems might require `libfuse2` to run AppImages. If you encounter issues, try installing it. For example, on Debian/Ubuntu: `sudo apt-get update && sudo apt-get install libfuse2`. For Fedora: `sudo dnf install fuse-libs`.
    * You might consider using a tool like "AppImageLauncher" to integrate it better into your system (optional).
3.  **For `.deb` files (Debian/Ubuntu-based systems):**
    * You can usually install it by double-clicking the file or using the command line:
        ```bash
        sudo dpkg -i torn-status-widget_x.y.z_amd64.deb
        sudo apt-get install -f # To install any missing dependencies
        ```
    * After installation, you should find the application in your system's application menu.

## Usage

1.  **Launch the Application:**
    * **Windows:** Find "Torn Status Widget" in your Start Menu or use the desktop shortcut.
    * **macOS:** Open from your `Applications` folder (following the first-launch instructions above if needed).
    * **Linux:** Launch from your applications menu (if installed via `.deb`) or by running the AppImage.

2.  **Initial Setup (API Key & ToS):**
    * On first launch, or if no API key is configured, you'll be prompted to enter your Torn API Key. Obtain this from Torn City: [Preferences -> API Key](https://www.torn.com/preferences.php#tab=api).
    * You must also check the box to accept the [Terms of Service](https://gnsc4.org/TornWidgetToS.html).
    * Enter your key, accept the ToS, and click "Save".
    * You can also toggle the "Start widget on system boot" option during this initial setup if it's your first time setting up the API key.

3.  **Interacting with the Widget:**
    * **Header Buttons:**
        * **⚙️ (Settings):** Opens the settings panel.
        * **−/□ (Minimize/Maximize):** Toggles between full and compact icon view.
        * **× (Close):** Closes the widget (behavior depends on "Close to Tray" setting).
    * **Dragging:** Click and drag the header area to move the widget.
    * **Links:** Most status items and notification icons are clickable, taking you to relevant Torn.com pages.
    * **Tooltips:** Hover over timers (e.g., energy, cooldowns) to see detailed end times.
    * **Tray Icon (System Tray):**
        * **Left-click:** Toggles the widget's visibility (Show/Hide).
        * **Right-click (or single click on some systems):** Opens a menu to "Show Widget" or "Quit" the application entirely.

4.  **Settings Panel:**
    The settings panel is organized into collapsible categories:
    * **API Key Management:**
        * **API Key Input:** Enter a new API Key if you need to change it.
        * **Save Key Button:** Saves the newly entered API key.
        * **Clear Key Button:** Removes the currently saved API key. This will require you to go through the initial API key setup again.
    * **Item Link Destinations:**
        * Customize where links for certain items take you. For each item type (Drugs, Boosters, Medical, E Refill, N Refill), you can toggle between:
            * **Personal:** Links to your personal items page on Torn.com.
            * **Faction:** Links to the respective item section in your faction's armoury.
    * **Application Behavior:**
        * **Start widget on system boot:** Toggle whether the widget launches automatically when your computer starts.
        * **Always on Top:** Toggle whether the widget stays above all other windows.
        * **Close button minimizes to tray:** Toggle whether clicking the '×' button closes the application or minimizes it to the system tray.
        * **Enable Desktop Notifications:** A master switch to enable or disable all desktop pop-up notifications from the widget.
    * **Notification Settings:** (Requires "Enable Desktop Notifications" to be active for system pop-ups)
        * **Enable Voice Notifications (Read Aloud):** A master switch to enable or disable spoken notifications.
        * **Cooldowns:**
            * Notify when Booster cooldown complete
            * Notify when Medical cooldown complete
            * Notify when Drug cooldown complete
        * **Energy & Nerve:**
            * Notify when Energy is full
            * Notify when Nerve is full
            * Notify when Energy reaches: [Value] (Set a custom energy level for notification)
        * **Life:**
            * Notify when Life decreases
            * Notify when Life is at maximum
        * **New Day:**
            * Notify on New Day
            * Notify 1 hour before New Day
        * **Travel:**
            * Notify 2 minutes before travel landing
            * Notify on travel arrival
        * **Racing:**
            * Notify when race is starting
            * Notify when race has finished
    * **UI Element Flashing:**
        * Configure which UI elements flash to indicate a ready or full status:
            * Energy Full
            * Nerve Full
            * Happiness Full
            * Booster Ready
            * Medical Ready
            * Drug Ready
            * Travel Arrived (Label Flash)
            * Race Finished (Label Flash)
    * Click "Close" at the bottom of the settings panel to save any changes and return to the main widget view.

5.  **Automatic Updates:**
    * The widget automatically checks for new versions from GitHub on startup (system dialog).
    * It also checks every 15 minutes and displays an in-app notification if a new version is available.

## Development

Built with Tauri v2.5. If you wish to contribute or run the application from source:

### Prerequisites

* [Node.js](https://nodejs.org/) (LTS recommended, includes npm)
* [Rust](https://www.rust-lang.org/tools/install) (stable toolchain)
* [Tauri CLI v2 prerequisites](https://v2.tauri.app/start/prerequisites/) for your specific OS (WebView2 for Windows, WebKitGTK for Linux, Xcode Command Line Tools for macOS).
* Tauri CLI v2.5 (or compatible beta):
    ```bash
    # Ensure you are using a Tauri CLI version compatible with @tauri-apps/api@^2.5.0
    # For example, if using a beta:
    npm install -g @tauri-apps/cli@^2.5.0
    # or
    yarn global add @tauri-apps/cli@^2.5.0
    # or
    cargo install tauri-cli --version "^2.5.0"
    ```

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
# For Tauri v2, the command might be slightly different, refer to official v2 docs.
# A common approach for v1 was:
# tauri signer generate -w ~/.tauri/keys
# For v2, it might be:
tauri signer generate
# And then manage keys typically in src-tauri/keys or a path you specify.
# Follow the prompts. You'll need to update the updater.pubkey in src-tauri/tauri.conf.json
# and set TAURI_PRIVATE_KEY and TAURI_KEY_PASSWORD environment variables if you use your own key for a fork.
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
