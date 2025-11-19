use std::{path::PathBuf, time::Duration};

use tauri::{async_runtime, Emitter, LogicalSize, Manager, Size};

use crate::AppState;

// deletes current file
#[tauri::command]
pub fn delete_file(app_handle: tauri::AppHandle, state: tauri::State<AppState>) {
  let mut list = state.list.lock().unwrap();

  let downloaded = match list.pop_front() {
    Some(d) => d,
    None => return,
  };

  println!("Deleting {} now", &downloaded.name());

  downloaded.delete();

  if let Some(more) = list.front() {
    println!("Sending {} to frontend.", &more.name());
    app_handle.emit("file_added", more).unwrap();
    return;
  }
  app_handle
    .get_webview_window("main")
    .unwrap()
    .hide()
    .unwrap();
  app_handle
    .get_webview_window("delayOptions")
    .unwrap()
    .hide()
    .unwrap();
}

// ignores current file
#[tauri::command]
pub fn ignore_file(app_handle: tauri::AppHandle, state: tauri::State<AppState>) {
  let mut list = state.list.lock().unwrap();

  let downloaded = match list.pop_front() {
    Some(d) => d,
    None => return,
  };

  println!("Ignoring {}", &downloaded.name());

  if let Some(more) = list.front() {
    println!("Sending {} to frontend.", &more.name());
    app_handle.emit("file_added", more).unwrap();
    return;
  }
  app_handle
    .get_webview_window("main")
    .unwrap()
    .hide()
    .unwrap();
  app_handle
    .get_webview_window("delayOptions")
    .unwrap()
    .hide()
    .unwrap();
}

// moves current file to another position
#[tauri::command]
pub fn move_file(app_handle: tauri::AppHandle, state: tauri::State<AppState>, folder: PathBuf) {
  let mut list = state.list.lock().unwrap();
  let downloaded = match list.pop_front() {
    Some(d) => d,
    None => return,
  };

  println!("Moving {} to {}", &downloaded.name(), folder.display());
  downloaded.move_to(folder);

  if let Some(more) = list.front() {
    println!("Sending {} to frontend.", &more.name());
    app_handle.emit("file_added", more).unwrap();
    return;
  }
  app_handle
    .get_webview_window("main")
    .unwrap()
    .hide()
    .unwrap();
  app_handle
    .get_webview_window("delayOptions")
    .unwrap()
    .hide()
    .unwrap();
}

// deletes current file after time
#[tauri::command]
pub fn delete_file_after(app_handle: tauri::AppHandle, state: tauri::State<AppState>, delay: u64) {
  let mut list = state.list.lock().unwrap();

  let downloaded = match list.pop_front() {
    Some(d) => d,
    None => return,
  };

  println!("Deleting {} in {} seconds", &downloaded.name(), &delay);

  async_runtime::spawn(async move {
    tokio::time::sleep(Duration::from_secs(delay)).await;
    println!("Deleting {} now", &downloaded.name());
    downloaded.delete();
  });

  if let Some(more) = list.front() {
    println!("Sending {} to frontend.", &more.name());
    app_handle.emit("file_added", more).unwrap();
    return;
  }
  app_handle
    .get_webview_window("main")
    .unwrap()
    .hide()
    .unwrap();
  app_handle
    .get_webview_window("delayOptions")
    .unwrap()
    .hide()
    .unwrap();
}

#[tauri::command]
pub fn open_delay_options(app_handle: tauri::AppHandle) -> bool {
  match app_handle
    .get_webview_window("main")
    .unwrap()
    .set_size(Size::Logical(LogicalSize {
      width: 450.0,
      height: 250.0,
    })) {
    Ok(_) => true,
    Err(_) => false,
  }
}

#[tauri::command]
pub fn close_delay_options(app_handle: tauri::AppHandle) -> bool {
  match app_handle
    .get_webview_window("main")
    .unwrap()
    .set_size(Size::Logical(LogicalSize {
      width: 450.0,
      height: 200.0,
    })) {
    Ok(_) => false,
    Err(_) => false,
  }
}
