use std::{fs, path::PathBuf};

use serde::Serialize;

#[derive(Serialize, Clone, Debug)]
pub struct Dowloaded {
  location: PathBuf,
  display_name: String,
}

impl Dowloaded {
  pub fn new(location: PathBuf, display_name: String) -> Self {
    Dowloaded {
      location,
      display_name,
    }
  }

  pub fn location(&self) -> PathBuf {
    self.location.clone()
  }

  pub fn name(&self) -> String {
    self.display_name.clone()
  }

  pub fn delete(self) {
    let metadata = fs::metadata(&self.location).unwrap();

    if metadata.is_file() {
      let _ = fs::remove_file(&self.location);
    } else if metadata.is_dir() {
      let _ = fs::remove_dir_all(&self.location);
    }
  }

  pub fn move_to(self, folder: PathBuf) {
    let mut new_path = folder.clone();
    new_path.push(&self.location.file_name().unwrap());

    if let Err(e) = fs::copy(&self.location, &new_path) {
      println!("Copy failed: {}", e);
      return;
    }

    if let Err(e) = fs::remove_file(&self.location) {
      println!("Remove failed: {}", e);
      return;
    }
  }
}
