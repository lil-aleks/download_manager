use std::{collections::VecDeque, sync::Mutex};
use tauri::{App, Emitter, Manager};

use crate::commands::{
  close_delay_options, delete_file, delete_file_after, ignore_file, move_file, open_delay_options,
};
use crate::downloaded::Dowloaded;

mod commands;
mod downloaded;

struct AppState {
  list: Mutex<VecDeque<Dowloaded>>,
  _watcher: Mutex<Option<notify::RecommendedWatcher>>,
}

pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_autostart::Builder::new().build())
    .plugin(tauri_plugin_dialog::init())
    .manage(AppState {
      list: Mutex::new(VecDeque::new()),
      _watcher: Mutex::new(None),
    })
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![
      move_file,
      delete_file_after,
      delete_file,
      ignore_file,
      open_delay_options,
      close_delay_options
    ])
    .setup(|app| {
      setup(app);
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

fn setup(app: &mut App) {
  use notify::{recommended_watcher, EventKind, Watcher};
  use tauri_plugin_autostart::MacosLauncher;
  use tauri_plugin_autostart::ManagerExt;

  app.handle().plugin(tauri_plugin_autostart::init(
    MacosLauncher::LaunchAgent,
    None,
  )).unwrap();

  let autostart_manager = app.autolaunch();
  let _ = autostart_manager.enable();
  
  println!(
    "registered for autostart? {}",
    autostart_manager.is_enabled().unwrap()
  );
  

  let downloads_folder = dirs_next::download_dir().unwrap();

  let app_handle = app.app_handle().clone();

  let mut watcher = recommended_watcher(move |res: notify::Result<notify::Event>| {
    if let Ok(event) = res {
      if let EventKind::Modify(_) = event.kind {
        if let Some(path) = event.paths.first() {
          if let Some(ext) = path.extension() {
            if ext == "crdownload" || ext == "tmp" || ext == "part" {
              return;
            }
          }
          let state = app_handle.try_state::<AppState>().unwrap();
          let downloaded = Dowloaded::new(
            path.to_path_buf(),
            path
              .file_name()
              .unwrap()
              .to_os_string()
              .into_string()
              .unwrap(),
          );

          let mut list = state.list.lock().unwrap();

          if list.iter().any(|d| d.location() == downloaded.location()) {
            return;
          }
          println!(
            "Download detected: {} at {}",
            &downloaded.name(),
            &downloaded.location().display()
          );

          if list.is_empty() {
            println!("Sending {} to frontend.", &downloaded.name());
            app_handle.emit("file_added", &downloaded).unwrap();
          }

          list.push_back(downloaded);

          app_handle
            .get_webview_window("main")
            .unwrap()
            .show()
            .unwrap();
        }
      }
    }
  })
  .unwrap();

  watcher
    .watch(&downloads_folder, notify::RecursiveMode::Recursive)
    .unwrap();

  let state = app.try_state::<AppState>().unwrap();
  *state._watcher.lock().unwrap() = Some(watcher);
}
