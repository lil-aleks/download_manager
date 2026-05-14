use std::{fs, io, path::PathBuf, time::Duration};

use serde::{Deserialize, Serialize};
use tauri::async_runtime;

#[derive(Serialize, Deserialize)]
pub struct DownloadedFileIn {
  id: i64,
  display_name: String,
  action: Action,
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "action")]
enum Action {
  Delete { after: i64 },
  Ignore,
  Extract { to: PathBuf },
  Move { to: PathBuf },
}

#[derive(Serialize, Deserialize)]
pub struct DownloadedFile {
  id: i16,
  location: PathBuf,
  zip_archive: bool,
}

impl DownloadedFile {
  pub fn new(id: i16, location: PathBuf) -> DownloadedFile {
    DownloadedFile {
      id,
      location,
      zip_archive: false,
    }
  }

  fn delete(self) -> io::Result<()> {
    let metadata = fs::metadata(&self.location)?;

    if metadata.is_file() {
      fs::remove_file(&self.location)
    } else {
      fs::remove_dir_all(&self.location)
    }
  }

  pub fn delete_after(self, after: i64) -> io::Result<()> {
    if after <= 0 {
      self.delete()
    } else {
      async_runtime::spawn(async move {
        tokio::time::sleep(Duration::from_mins(after as u64)).await;
        if let Err(e) = self.delete() {
          eprintln!("Delete failed: {}", e);
        }
      });
      Ok(())
    }
  }

  pub fn r#move(self, mut to: PathBuf) -> io::Result<()> {
    let file_name = match self.location.file_name() {
      Some(name) => name,
      None => return Err(io::Error::new(io::ErrorKind::Other, "Invalid file name")),
    };
    to.push(file_name);

    match fs::rename(&self.location, &to) {
      Ok(_) => Ok(()),
      Err(e) => {
        // Fallback: cross-device move
        if e.kind() == io::ErrorKind::CrossesDevices {
          fs::copy(&self.location, &to)?;
          self.delete()
        } else {
          Err(e)
        }
      }
    }
  }

  pub fn rename(&mut self, new_name: String) -> io::Result<()> {
    let current_path = &self.location;

    let new_path = match current_path.parent() {
      Some(parent) => parent.join(new_name),
      None => {
        return Err(io::Error::new(
          io::ErrorKind::Other,
          "Invalid path: no parent directory",
        ))
      }
    };

    fs::rename(current_path, &new_path)?;
    self.location = new_path;

    io::Result::Ok(())
  }
}

pub fn handle_action(
  mut downloaded_file: DownloadedFile,
  downloaded_file_in: DownloadedFileIn,
) -> io::Result<()> {
  downloaded_file.rename(downloaded_file_in.display_name)?;
  match downloaded_file_in.action {
    Action::Ignore => io::Result::Ok(()),
    Action::Delete { after } => downloaded_file.delete_after(after),
    Action::Extract { to } => io::Result::Ok(()), // TODO: Extract compressed files like .zip for example.
    Action::Move { to } => downloaded_file.r#move(to),
  }
}
