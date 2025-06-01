// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Tauri v2 imports
use tauri::{AppHandle, Manager, Runtime};
// Use tauri::image::Image for tray icon and other image operations
use tauri::image::Image as TauriImage; 
use tauri::menu::{Menu, MenuBuilder, MenuItemBuilder, PredefinedMenuItem};
use tauri::tray::{TrayIconBuilder, TrayIconEvent, MouseButton as TrayMouseButton};

// image crate for decoding - REMEMBER TO ADD `image = { version = "0.25", features = ["png"] }` to Cargo.toml
// GenericImageView is removed as it was flagged as unused.
// use image::GenericImageView; 

// Autostart plugin (v2)
use tauri_plugin_autostart::MacosLauncher;

// Learn more about Tauri commands at https://tauri.app/v2/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// Helper function to build the tray menu
fn build_tray_menu<R: Runtime>(app_handle: &AppHandle<R>) -> tauri::Result<Menu<R>> {
    // Create "Show Widget" menu item
    let show_item = MenuItemBuilder::with_id("show_widget", "Show Widget").build(app_handle)?;
    // Create "Quit" menu item
    let quit_item = MenuItemBuilder::with_id("quit_app", "Quit").build(app_handle)?;
    // Create a separator
    let separator = PredefinedMenuItem::separator(app_handle)?;

    // Build the menu
    MenuBuilder::new(app_handle)
        .items(&[&show_item, &separator, &quit_item])
        .build()
}


fn main() {
    let context = tauri::generate_context!();

    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec!["--some-flag"])))
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let app_handle = app.handle().clone();

            let tray_menu = build_tray_menu(&app_handle)?;

            // Load tray icon from bytes using the `image` crate
            let tray_icon_bytes = include_bytes!("../icons/icon.png");
            // Attempt to decode the image from memory
            let decoded_image = image::load_from_memory(tray_icon_bytes)
                .map_err(|e| tauri::Error::AssetNotFound(format!("Failed to decode tray icon: {}", e)))?;
            // Convert to RGBA8 format, which is commonly used
            let rgba_image = decoded_image.to_rgba8();
            // Get dimensions
            let (width, height) = rgba_image.dimensions();
            // Get raw pixel data
            let tray_icon_rgba_data = rgba_image.into_raw();

            // Create TauriImage from the raw RGBA data and dimensions
            let tray_icon = TauriImage::new_owned(tray_icon_rgba_data, width, height);

            let _final_tray = TrayIconBuilder::with_id("main-tray")
                .tooltip("Torn Status Widget")
                .icon(tray_icon)
                .menu(&tray_menu)
                .on_menu_event(move |app_handle, event| {
                    match event.id.as_ref() {
                        "show_widget" => {
                            if let Some(window) = app_handle.get_webview_window("main") {
                                window.show().unwrap_or_else(|e| eprintln!("Failed to show window: {}", e));
                                window.set_focus().unwrap_or_else(|e| eprintln!("Failed to focus window: {}", e));
                            } else {
                                eprintln!("Failed to get main window handle for show_widget");
                            }
                        }
                        "quit_app" => {
                            app_handle.exit(0);
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray_instance, event| {
                    match event {
                        TrayIconEvent::Click { button: TrayMouseButton::Left, .. } => {
                            let app = tray_instance.app_handle();
                            // Use _window_check to use the variable and potentially silence warnings if only methods are called.
                            if let Some(_window_check) = app.get_webview_window("main") {
                                if _window_check.is_visible().unwrap_or(false) {
                                    let _ = _window_check.hide();
                                } else {
                                    let _ = _window_check.show();
                                    let _ = _window_check.set_focus();
                                }
                            }
                        }
                        _ => {}
                    }
                })
                .build(app)?;

            // Window vibrancy setup (platform-specific).
            // Renamed `window` to `_window` to silence unused variable warning on non-macOS targets
            // when Windows vibrancy code is commented out.
            if let Some(_window) = app.get_webview_window("main") {
                #[cfg(target_os = "macos")]
                {
                    use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};
                    // Use `_window` here
                    apply_vibrancy(&_window, NSVisualEffectMaterial::HudWindow, None, None)
                      .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");
                }

                #[cfg(target_os = "windows")]
                {
                    // For Windows vibrancy:
                    // use window_vibrancy::{apply_blur, Color};
                    // apply_blur(&_window, Some(Color::from_rgba(30, 30, 30, 150))) // Use `_window` here too if uncommented
                    //   .expect("Unsupported platform! 'apply_blur' is only supported on Windows");
                }
            } else {
                 eprintln!("Failed to get main window for vibrancy setup.");
            }
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(context)
        .expect("error while running tauri application");
}
