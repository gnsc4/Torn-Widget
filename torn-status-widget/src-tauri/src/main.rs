// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Use the official tauri-plugin-autostart
use tauri_plugin_autostart::MacosLauncher;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    let context = tauri::generate_context!();

    tauri::Builder::default()
        // Initialize the official autostart plugin
        // The second argument `None` means no specific command-line args are passed when autostarting.
        // You can pass Some(vec!["--hidden".into()]) for example, if your app supports it.
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, None))
        .setup(|app| {
            use tauri::Manager;

            let window = app.get_window("main").ok_or_else(|| "Failed to get main window")?;

            #[cfg(target_os = "macos")]
            {
                use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};
                apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
                  .expect("Unsupported platform! 'apply_vibrancy' is only Ssupported on macOS");
            }

            #[cfg(target_os = "windows")]
            {
                // use window_vibrancy::apply_blur;
                // apply_blur(&window, Some((18, 18, 18, 125)))
                //   .expect("Unsupported platform! 'apply_blur' is only supported on Windows");
            }
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(context)
        .expect("error while running tauri application");
}
