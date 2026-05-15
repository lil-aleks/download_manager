use std::path::PathBuf;
use std::{collections::VecDeque, sync::Mutex};

use notify::{recommended_watcher, EventKind, Watcher};
use serde::Serialize;
use tauri::{App, Emitter, Manager};

use crate::file_download::*;

mod file_download;

#[derive(Serialize)]
struct FooterInfo {
  link: String,
  version: String,
}

struct AppState {
  list: Mutex<VecDeque<DownloadedFile>>,
  _watcher: Mutex<Option<notify::RecommendedWatcher>>,
}

#[tauri::command]
async fn get_footer_info() -> Result<FooterInfo, String> {
  Ok(FooterInfo {
    link: env!("CARGO_PKG_HOMEPAGE").into(),
    version: env!("CARGO_PKG_VERSION").into(),
  })
}

#[tauri::command]
async fn perform_action(app_handle: tauri::AppHandle, state: tauri::State<'_, AppState>, file_action: DownloadedFileIn) -> Result<(), String> {
  let mut list = state.list.lock().unwrap();
  let id = file_action.id.clone() as usize;
  let Some(original) = list.get(id).cloned() else {
    app_handle
      .get_webview_window("download")
      .unwrap()
      .hide()
      .unwrap();
    return Ok(());
  };

  if let Ok(()) = handle_action(original, file_action) {
    list.remove(id);
    if let Some(more) = list.front() {
      app_handle.emit("file_added", more).unwrap();
    } else {
      app_handle
        .get_webview_window("download")
        .unwrap()
        .hide()
        .unwrap();
    }
    Ok(())
  } else {
    Err("Error while performing action. Try ignoring the file".to_string())
  }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_opener::init())
    .manage(AppState {
      list: Mutex::new(VecDeque::new()),
      _watcher: Mutex::new(None),
    })
    .invoke_handler(tauri::generate_handler![get_footer_info, perform_action])
    .setup(|app| {
      setup(app);
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

fn setup(app: &mut App) {
  // dont open setting window if app started after bootup
  if std::env::args().any(|arg| arg == "--silent") {
    if let Some(window) = app.get_webview_window("settings") {
      window.hide().unwrap();
    }
  }

  #[cfg(not(dev))]
  {
    app
      .handle()
      .plugin(tauri_plugin_autostart::init(
        MacosLauncher::LaunchAgent,
        Some(vec!["--silent"]),
      ))
      .unwrap();
  }

  let download_dir = dirs_next::download_dir().unwrap();
  setup_watcher(app, download_dir);
}

fn setup_watcher(app: &mut App, dir: PathBuf) {
  let app_handle = app.app_handle().clone();

  let mut watcher = recommended_watcher(move |res: notify::Result<notify::Event>| {
    let Ok(event) = res else { return };

    if !matches!(event.kind, EventKind::Modify(_)) {
      return;
    }

    let Some(path) = event.paths.first() else {
      return;
    };

    if matches!(
      path.extension().and_then(|e| e.to_str()),
      Some("crdownload" | "tmp" | "part")
    ) {
      return;
    }

    let state = app_handle.state::<AppState>();

    let mut list = state.list.lock().unwrap();

    let downloaded = DownloadedFile::new(list.len() as i16, path.to_path_buf());

    if list.iter().any(|d| d.location == downloaded.location) {
      return;
    }
    
    if list.is_empty() {
      //Send to frontend
      app_handle.emit("file_added", &downloaded).unwrap();
    }

    list.push_back(downloaded);

    app_handle
      .get_webview_window("download")
      .unwrap()
      .show()
      .unwrap();
  })
  .unwrap();

  watcher
    .watch(&dir, notify::RecursiveMode::NonRecursive)
    .unwrap();

  let state = app.state::<AppState>();

  *state._watcher.lock().unwrap() = Some(watcher);
}
