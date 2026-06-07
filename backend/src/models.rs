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

#[derive(Serialize, Deserialize, Clone)]
pub struct RecycleBinItem {
    pub id: String,
    pub file_id: String,
    pub file_name: String,
    pub file_path: String,
    pub size: u64,
    pub hash: String,
    pub deleted_at: String,
    pub deleted_by: String,
    pub deleted_from: String,
    pub expires_at: String,
    pub restored: bool,
    pub restored_at: Option<String>,
    pub restored_to: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct RestoreResult {
    pub success: bool,
    pub message: String,
    pub item: Option<RecycleBinItem>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TimeRange {
    pub start: String,
    pub end: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct SyncSchedule {
    pub id: String,
    pub folder_id: String,
    pub folder_name: String,
    pub folder_path: String,
    pub schedule_type: String,
    pub enabled: bool,
    pub weekdays: Vec<String>,
    pub time_range: TimeRange,
    pub interval_minutes: Option<u32>,
    pub last_run: Option<String>,
    pub next_run: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ScheduleExecution {
    pub id: String,
    pub schedule_id: String,
    pub folder_id: String,
    pub status: String,
    pub start_time: String,
    pub end_time: Option<String>,
    pub files_synced: Option<u32>,
    pub error_message: Option<String>,
}

#[derive(Deserialize)]
pub struct CreateScheduleRequest {
    pub folder_id: String,
    pub folder_name: String,
    pub folder_path: String,
    pub schedule_type: String,
    pub enabled: bool,
    pub weekdays: Vec<String>,
    pub time_range: TimeRange,
    pub interval_minutes: Option<u32>,
}

#[derive(Deserialize)]
pub struct UpdateScheduleRequest {
    pub folder_id: Option<String>,
    pub folder_name: Option<String>,
    pub folder_path: Option<String>,
    pub schedule_type: Option<String>,
    pub enabled: Option<bool>,
    pub weekdays: Option<Vec<String>>,
    pub time_range: Option<TimeRange>,
    pub interval_minutes: Option<u32>,
}
