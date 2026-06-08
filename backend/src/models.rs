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

#[derive(Serialize, Deserialize, Clone)]
pub struct ShareLink {
    pub id: String,
    pub token: String,
    pub file_id: String,
    pub file_name: String,
    pub file_path: String,
    pub version_id: Option<String>,
    pub version_number: Option<u32>,
    pub size: u64,
    pub hash: String,
    pub created_by: String,
    pub created_at: String,
    pub expires_at: String,
    pub access_count: u32,
    pub max_access_count: Option<u32>,
    pub is_active: bool,
}

#[derive(Deserialize)]
pub struct CreateShareLinkRequest {
    pub file_id: String,
    pub file_name: String,
    pub file_path: String,
    pub version_id: Option<String>,
    pub version_number: Option<u32>,
    pub size: u64,
    pub hash: String,
    pub created_by: String,
    pub expires_in_hours: u32,
    pub max_access_count: Option<u32>,
}

#[derive(Serialize)]
pub struct ShareLinkAccessResult {
    pub valid: bool,
    pub message: String,
    pub share_link: Option<ShareLink>,
}

#[derive(Deserialize)]
pub struct UpdateShareLinkRequest {
    pub is_active: Option<bool>,
    pub expires_at: Option<String>,
    pub max_access_count: Option<u32>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct SyncResultSummary {
    pub added: u32,
    pub modified: u32,
    pub deleted: u32,
    pub conflicted: u32,
    pub failed: u32,
    pub retried: u32,
    pub total_size: u64,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct FailedFileEntry {
    pub path: String,
    pub error: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct RetriedFileEntry {
    pub path: String,
    pub attempt: u32,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct SyncResultDetail {
    pub added_files: Vec<String>,
    pub modified_files: Vec<String>,
    pub deleted_files: Vec<String>,
    pub conflicted_files: Vec<String>,
    pub failed_files: Vec<FailedFileEntry>,
    pub retried_files: Vec<RetriedFileEntry>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct DailySyncReport {
    pub id: String,
    pub date: String,
    pub device_id: String,
    pub device_name: String,
    pub summary: SyncResultSummary,
    pub details: SyncResultDetail,
    pub generated_at: String,
    pub read: bool,
}

#[derive(Deserialize)]
pub struct GenerateDailyReportRequest {
    pub device_id: String,
}
