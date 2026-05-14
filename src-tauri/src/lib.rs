use serde::Serialize;

mod file_download;

#[derive(Serialize)]
struct FooterInfo {
    link: String,
    version: String,
}

#[tauri::command]
async fn get_footer_info() -> Result<FooterInfo, String> {
    Ok(FooterInfo {
        link: env!("CARGO_PKG_HOMEPAGE").into(),
        version: env!("CARGO_PKG_VERSION").into(),
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_footer_info])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
