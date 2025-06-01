// This file can be used for library functions shared across your Rust code,
// or for specific logic when targeting other platforms like mobile.

// The `greet` command is defined and handled in `src/main.rs` for the desktop application.
// If you had other commands or shared Rust logic intended to be used as a library,
// they could reside here.

// The run() function below is marked as a mobile entry point.
// For the desktop application (which uses src/main.rs as its entry),
// this function and its tauri::Builder setup are likely not invoked.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // This Tauri application setup would be for a mobile target.
    // For the desktop target, main.rs handles the application setup.
    // If you were to build for mobile, this section would need
    // a similar Tauri v2 update (plugin registration, etc.)
    // as we performed for main.rs.

    /*
    // Example of what a mobile-specific or lib-based run might look like (needs v2 updates):
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![/* any commands specific to this entry point */])
        .run(tauri::generate_context!())
        .expect("error while running tauri application (from lib.rs)");
    */

    // For now, if this run() function were somehow called in a desktop context
    // where main.rs is also running, it would conflict.
    // Assuming it's exclusively for mobile or an uncalled library function for desktop.
    println!("lib.rs run() called. Note: For desktop, main.rs is the primary entry point.");
}

// The 'greet' command has been removed from lib.rs to avoid duplication
// with the one defined and registered in main.rs for the desktop application.
// If lib.rs were to provide commands, they should be managed to avoid conflicts
// (e.g., by namespacing or selective registration in main.rs like `your_crate::command_name`).
