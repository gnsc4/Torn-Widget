// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Use the official tauri-plugin-autostart
use tauri_plugin_autostart::MacosLauncher;
// Tauri imports for System Tray
use tauri::{CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    let context = tauri::generate_context!();

    // --- System Tray Menu Definition ---
    // Create "Show Widget" menu item
    let show_item = CustomMenuItem::new("show_widget".to_string(), "Show Widget");
    // Create "Quit" menu item
    let quit_item = CustomMenuItem::new("quit_app".to_string(), "Quit");

    // Build the system tray menu
    let tray_menu = SystemTrayMenu::new()
        .add_item(show_item)
        .add_native_item(SystemTrayMenuItem::Separator) // Adds a visual separator
        .add_item(quit_item);

    // Create the system tray
    let system_tray = SystemTray::new().with_menu(tray_menu);
    // --- End of System Tray Menu Definition ---

    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, None))
        // Add the system tray
        .system_tray(system_tray)
        // Add the handler for system tray events
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => {
                // Get a handle to the app
                let app_handle = app.app_handle();
                match id.as_str() {
                    "show_widget" => {
                        // Get the main window
                        if let Some(window) = app_handle.get_window("main") {
                            // Show the window if it's hidden
                            window.show().unwrap_or_else(|e| eprintln!("Failed to show window: {}", e));
                            // Bring the window to the front and give it focus
                            window.set_focus().unwrap_or_else(|e| eprintln!("Failed to focus window: {}", e));
                        } else {
                            eprintln!("Failed to get main window handle for show_widget");
                        }
                    }
                    "quit_app" => {
                        // Exit the application
                        app_handle.exit(0);
                    }
                    _ => {}
                }
            }
            _ => {}
        })
        .setup(|app| {
            // Prefix the window variable with an underscore to signify it might be unused
            // depending on the compilation target.
            let _window = app.get_window("main").ok_or_else(|| "Failed to get main window")?;

            #[cfg(target_os = "macos")]
            {
                use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};
                // Use the corrected variable name _window
                apply_vibrancy(&_window, NSVisualEffectMaterial::HudWindow, None, None)
                  .expect("Unsupported platform! 'apply_vibrancy' is only Ssupported on macOS");
            }

            #[cfg(target_os = "windows")]
            {
                // If you uncomment this section, ensure to use _window as well.
                // use window_vibrancy::apply_blur;
                // apply_blur(&_window, Some((18, 18, 18, 125)))
                //   .expect("Unsupported platform! 'apply_blur' is only supported on Windows");
            }
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(context)
        .expect("error while running tauri application");
}
