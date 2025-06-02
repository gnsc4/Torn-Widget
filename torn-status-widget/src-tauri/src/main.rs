// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Tauri v2 imports
use tauri::{AppHandle, Manager, Runtime, State, WindowEvent};
use tauri::image::Image as TauriImage; 
use tauri::menu::{Menu, MenuBuilder, MenuItemBuilder, PredefinedMenuItem};
use tauri::tray::{TrayIconBuilder, TrayIconEvent, MouseButton as TrayMouseButton};
use std::sync::Mutex;

// Tauri Plugins (ensure these match your Cargo.toml)
use tauri_plugin_autostart::MacosLauncher;
// For tauri-plugin-notification, the main interaction is often via JS,
// but we need to initialize it. The JS API will use NotificationExt trait methods if called from Rust.
// However, for just enabling it, initializing the plugin is key.

// State to hold the preference for closing to tray
pub struct CloseToTrayState(pub Mutex<bool>);

// Learn more about Tauri commands at https://tauri.app/v2/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn set_close_to_tray_preference(preference: bool, state: State<CloseToTrayState>) -> Result<(), String> {
    match state.0.lock() {
        Ok(mut close_to_tray) => {
            *close_to_tray = preference;
            println!("[Rust Backend] Close to tray preference set to: {}", preference);
            Ok(())
        }
        Err(e) => {
            let err_msg = format!("[Rust Backend] Error locking CloseToTrayState: {}", e);
            eprintln!("{}", err_msg);
            Err(err_msg)
        }
    }
}


// Helper function to build the tray menu (from user's existing code)
fn build_tray_menu<R: Runtime>(app_handle: &AppHandle<R>) -> tauri::Result<Menu<R>> {
    let show_item = MenuItemBuilder::with_id("show_widget", "Show Widget").build(app_handle)?;
    let quit_item = MenuItemBuilder::with_id("quit_app", "Quit").build(app_handle)?;
    let separator = PredefinedMenuItem::separator(app_handle)?;

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
        .plugin(tauri_plugin_updater::Builder::default().build())
        .plugin(tauri_plugin_notification::init()) // Initialize the notification plugin
        .manage(CloseToTrayState(Mutex::new(false))) 
        .invoke_handler(tauri::generate_handler![
            greet,
            set_close_to_tray_preference 
        ])
        .setup(|app| {
            let app_handle = app.handle().clone();

            let tray_menu = build_tray_menu(&app_handle)?;

            let tray_icon_bytes = include_bytes!("../icons/icon.png"); 
            let decoded_image = image::load_from_memory(tray_icon_bytes)
                .map_err(|e| tauri::Error::AssetNotFound(format!("Failed to decode tray icon: {}", e)))?;
            let rgba_image = decoded_image.to_rgba8();
            let (width, height) = rgba_image.dimensions();
            let tray_icon_rgba_data = rgba_image.into_raw();
            let tray_icon = TauriImage::new_owned(tray_icon_rgba_data, width, height);

            let _final_tray = TrayIconBuilder::with_id("main-tray")
                .tooltip("Torn Status Widget")
                .icon(tray_icon)
                .menu(&tray_menu)
                .on_menu_event(move |app_handle_event, event| { 
                    match event.id.as_ref() {
                        "show_widget" => {
                            if let Some(window) = app_handle_event.get_webview_window("main") {
                                window.show().unwrap_or_else(|e| eprintln!("[Rust Backend] Failed to show window: {}", e));
                                window.set_focus().unwrap_or_else(|e| eprintln!("[Rust Backend] Failed to focus window: {}", e));
                            } else {
                                eprintln!("[Rust Backend] Failed to get main window handle for show_widget");
                            }
                        }
                        "quit_app" => {
                            app_handle_event.exit(0);
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray_instance, event| {
                    match event {
                        TrayIconEvent::Click { button: TrayMouseButton::Left, .. } => {
                            let app_tray = tray_instance.app_handle(); 
                            if let Some(window) = app_tray.get_webview_window("main") {
                                if window.is_visible().unwrap_or(false) {
                                    if let Err(e) = window.hide() {
                                        eprintln!("[Rust Backend] Error hiding window on tray left click: {}", e);
                                    }
                                } else {
                                    if let Err(e) = window.show() {
                                        eprintln!("[Rust Backend] Error showing window on tray left click: {}", e);
                                    }
                                    if let Err(e) = window.set_focus() {
                                         eprintln!("[Rust Backend] Error focusing window on tray left click: {}", e);
                                    }
                                }
                            }
                        }
                        _ => {}
                    }
                })
                .build(app)?;

            if let Some(_main_window) = app.get_webview_window("main") { 
                #[cfg(target_os = "macos")]
                {
                    use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};
                    apply_vibrancy(&_main_window, NSVisualEffectMaterial::HudWindow, None, None)
                      .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");
                }

                #[cfg(target_os = "windows")]
                {
                    // For Windows vibrancy (ensure window-vibrancy version supports this well):
                    // use window_vibrancy::{apply_blur}; // Color might be tauri::utils::Color in some contexts
                    // apply_blur(&_main_window, Some(window_vibrancy::Color::from_rgba(30, 30, 30, 150))) // Example color
                    //   .expect("Unsupported platform! 'apply_blur' is only supported on Windows");
                }
            } else {
                 eprintln!("[Rust Backend] Failed to get main window for vibrancy setup.");
            }
            
            Ok(())
        })
        .on_window_event(|window, event| { 
            match event {
                WindowEvent::CloseRequested { api, .. } => {
                    let state = window.state::<CloseToTrayState>();
                    let guard = state.0.lock().unwrap_or_else(|poisoned| {
                        eprintln!("[Rust Backend] CloseToTrayState Mutex poisoned! Defaulting to false. Error: {:?}", poisoned);
                        poisoned.into_inner() 
                    });
                    let close_to_tray_enabled = *guard; 

                    if close_to_tray_enabled {
                        println!("[Rust Backend] Close to tray enabled. Hiding window.");
                        if let Err(e) = window.hide() {
                            eprintln!("[Rust Backend] Error hiding window: {}", e);
                        }
                        api.prevent_close(); 
                    } else {
                        println!("[Rust Backend] Close to tray disabled. Exiting application.");
                        window.app_handle().exit(0); 
                    }
                }
                _ => {}
            }
        })
        .run(context)
        .expect("error while running tauri application");
}
