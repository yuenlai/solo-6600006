use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct SyncFile {
    pub id: String,
    pub path: String,
    pub name: String,
    pub size: u64,
    pub hash: String,
    pub modified_at: String,
    pub status: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct FileVersion {
    pub id: String,
    pub file_id: String,
    pub version: u32,
    pub size: u64,
    pub hash: String,
    pub created_at: String,
    pub author: String,
    pub change_type: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct SyncFolder {
    pub id: String,
    pub name: String,
    pub path: String,
    pub device_count: u32,
    pub last_synced: String,
    pub status: String,
}
