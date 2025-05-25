# Torn Status Widget

A desktop widget to monitor your Torn City status, including energy, nerve, happiness, cooldowns, refills, and notifications.

## Features

* **Real-time Status Updates:** Keep track of your vital Torn stats directly on your desktop.
* **API Key Integration:** Securely connect to your Torn account using your API key.
* **Stat Display:**
    * Life
    * Energy (with timer to full)
    * Nerve (with timer to full)
    * Happiness (with timer to full)
* **Cooldown Timers:**
    * Booster
    * Medical
    * Drug
* **Refill Status:**
    * Energy Refill
    * Nerve Refill
    * Token Refill
* **Notifications:**
    * New Messages
    * New Events
* **Customizable Interface:**
    * Minimize the widget
    * Always on top
    * Transparent background (platform dependent)
* **Autostart Option:** Configure the widget to start automatically when your system boots up.
* **Settings Panel:**
    * Manage API Key (save/clear)
    * Toggle autostart

## Installation

You can download the latest version of the Torn Status Widget for your operating system from the [**Releases**](https://github.com/gnsc4/Torn-Widget/releases) page on GitHub.

### Windows

1.  Download the `.msi` (Microsoft Installer) or `.exe` (NSIS Installer) file from the latest release.
2.  **For `.msi` files:**
    * Double-click the downloaded `.msi` file.
    * Follow the on-screen instructions in the installation wizard.
3.  **For `.exe` files (NSIS Installer):**
    * Double-click the downloaded `.exe` file.
    * Follow the on-screen instructions. The application will typically be installed, and a shortcut may be created.

### macOS

1.  Download the `.dmg` file from the latest release.
2.  Double-click the downloaded `.dmg` file to mount it.
3.  Drag the `torn-status-widget.app` icon into your `Applications` folder.
4.  You can now launch the application from your `Applications` folder or Launchpad.

### Linux

1.  Download the appropriate installer for your distribution (e.g., `.deb` for Debian/Ubuntu-based systems, or `.AppImage`).
2.  **For `.deb` files:**
    * You can usually install it by double-clicking the file or using the command line:
        ```bash
        sudo dpkg -i torn-status-widget_*.deb
        sudo apt-get install -f # To install any missing dependencies
        ```
3.  **For `.AppImage` files:**
    * Make the file executable:
        ```bash
        chmod +x torn-status-widget_*.AppImage
        ```
    * Run the application:
        ```bash
        ./torn-status-widget_*.AppImage
        ```

## Usage

1.  **Launch the Application:**
    * **Windows:** Find "Torn Status Widget" in your Start Menu or use the desktop shortcut if one was created.
    * **macOS:** Open it from your `Applications` folder or Launchpad.
    * **Linux:** Launch it from your applications menu or by running the AppImage.

2.  **Initial Setup (API Key):**
    * On the first launch, or if no API key is configured, you will be prompted to enter your Torn API Key.
    * You can obtain your API key from Torn City: [Preferences -> API Key](https://www.torn.com/preferences.php#tab=api).
    * Enter your key into the input field and click "Save".
    * You will also have an option to enable/disable "Start widget on system boot" during this initial setup.

3.  **Interacting with the Widget:**
    * **Header Buttons:**
        * **⚙️ (Settings):** Opens the settings panel where you can manage your API key and toggle the autostart feature.
        * **− (Minimize/Maximize):** Toggles the widget between its full view and a compact, minimized view.
        * **× (Close):** Closes the widget.
    * **Dragging:** Click and drag the header area of the widget to move it around your screen.
    * **Links:** Most status items and notification icons are clickable and will take you to the relevant page on Torn.com.
    * **Tooltips:** Hover over timers to see more details (e.g., when a cooldown will end).

4.  **Settings Panel:**
    * **API Key Management:**
        * Enter a new API key and click "Save Key".
        * Click "Clear Key" to remove the currently saved API key.
    * **Autostart:** Check or uncheck "Start widget on system boot" to control whether the application launches automatically when you log in.

## Development

If you wish to contribute or run the application from the source:

### Prerequisites

* [Node.js](https://nodejs.org/) (which includes npm)
* [Rust](https://www.rust-lang.org/tools/install)
* [Tauri CLI prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites) for your specific OS.
* Tauri CLI:
    ```bash
    npm install -g @tauri-apps/cli
    # or
    yarn global add @tauri-apps/cli
    # or
    cargo install tauri-cli
    ```

### Running in Development Mode

1.  Clone the repository:
    ```bash
    git clone [https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git)
    cd YOUR_REPOSITORY_NAME
    ```
2.  Install frontend dependencies:
    ```bash
    npm install
    ```
3.  Run the development server and the Tauri app:
    ```bash
    npm run tauri dev
    ```
    This uses `vite` for the frontend and `tauri` for the application shell. The `beforeDevCommand` (`npm run dev`) will be executed automatically.

### Building for Production

1.  Install frontend dependencies (if not already done):
    ```bash
    npm install
    ```
2.  Build the frontend:
    ```bash
    npm run build
    ```
3.  Build the Tauri application:
    ```bash
    npm run tauri build
    ```
    This will generate the installers/bundles in `src-tauri/target/release/bundle/`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
