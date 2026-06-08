use actix_web::{web, App, HttpServer, HttpResponse};
use actix_cors::Cors;
use serde::{Serialize, Deserialize};
use std::sync::Mutex;

mod models;
mod services;

use models::{RecycleBinItem, RestoreResult, SyncSchedule, ScheduleExecution, CreateScheduleRequest, UpdateScheduleRequest, ShareLink, CreateShareLinkRequest, ShareLinkAccessResult, UpdateShareLinkRequest, DailySyncReport, SyncResultSummary, SyncResultDetail, GenerateDailyReportRequest};

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    service: String,
}

async fn health() -> HttpResponse {
    HttpResponse::Ok().json(HealthResponse {
        status: "ok".to_string(),
        service: "FileSync Server".to_string(),
    })
}

async fn list_files() -> HttpResponse {
    HttpResponse::Ok().json(Vec::<String>::new())
}

async fn sync_folder(path: web::Path<String>) -> HttpResponse {
    let folder_id = path.into_inner();
    HttpResponse::Ok().json(serde_json::json!({
        "folder_id": folder_id,
        "status": "syncing",
        "progress": 0
    }))
}

struct AppState {
    recycle_bin: Mutex<Vec<RecycleBinItem>>,
    schedules: Mutex<Vec<SyncSchedule>>,
    schedule_executions: Mutex<Vec<ScheduleExecution>>,
    share_links: Mutex<Vec<ShareLink>>,
    daily_sync_reports: Mutex<Vec<DailySyncReport>>,
}

async fn list_recycle_bin(data: web::Data<AppState>) -> HttpResponse {
    let items = data.recycle_bin.lock().unwrap();
    HttpResponse::Ok().json(&*items)
}

#[derive(Deserialize)]
struct AddRecycleBinRequest {
    file_id: String,
    file_name: String,
    file_path: String,
    size: u64,
    hash: String,
    deleted_by: String,
    deleted_from: String,
}

async fn add_to_recycle_bin(
    data: web::Data<AppState>,
    req: web::Json<AddRecycleBinRequest>,
) -> HttpResponse {
    let now = chrono::Utc::now();
    let expires_at = now + chrono::Duration::days(30);
    
    let item = RecycleBinItem {
        id: format!("rb-{}", now.timestamp_millis()),
        file_id: req.file_id.clone(),
        file_name: req.file_name.clone(),
        file_path: req.file_path.clone(),
        size: req.size,
        hash: req.hash.clone(),
        deleted_at: now.to_rfc3339(),
        deleted_by: req.deleted_by.clone(),
        deleted_from: req.deleted_from.clone(),
        expires_at: expires_at.to_rfc3339(),
        restored: false,
        restored_at: None,
        restored_to: None,
    };
    
    let mut items = data.recycle_bin.lock().unwrap();
    items.insert(0, item.clone());
    HttpResponse::Ok().json(item)
}

async fn restore_from_recycle_bin(
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let item_id = path.into_inner();
    let mut items = data.recycle_bin.lock().unwrap();
    
    if let Some(pos) = items.iter().position(|i| i.id == item_id) {
        if items[pos].restored {
            return HttpResponse::BadRequest().json(RestoreResult {
                success: false,
                message: "该文件已被恢复".to_string(),
                item: None,
            });
        }
        
        let now = chrono::Utc::now();
        items[pos].restored = true;
        items[pos].restored_at = Some(now.to_rfc3339());
        items[pos].restored_to = Some(items[pos].file_path.clone());
        
        HttpResponse::Ok().json(RestoreResult {
            success: true,
            message: format!("文件已恢复到: {}", items[pos].file_path),
            item: Some(items[pos].clone()),
        })
    } else {
        HttpResponse::NotFound().json(RestoreResult {
            success: false,
            message: "文件不存在于回收站中".to_string(),
            item: None,
        })
    }
}

async fn delete_from_recycle_bin(
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let item_id = path.into_inner();
    let mut items = data.recycle_bin.lock().unwrap();
    
    if let Some(pos) = items.iter().position(|i| i.id == item_id) {
        items.remove(pos);
        HttpResponse::Ok().json(serde_json::json!({
            "success": true,
            "message": "文件已永久删除"
        }))
    } else {
        HttpResponse::NotFound().json(serde_json::json!({
            "success": false,
            "message": "文件不存在于回收站中"
        }))
    }
}

async fn clear_expired_recycle_bin(data: web::Data<AppState>) -> HttpResponse {
    let now = chrono::Utc::now();
    let mut items = data.recycle_bin.lock().unwrap();
    let original_len = items.len();
    
    items.retain(|item| {
        if let Ok(expires) = chrono::DateTime::parse_from_rfc3339(&item.expires_at) {
            let expires_utc = expires.with_timezone(&chrono::Utc);
            now <= expires_utc && !item.restored
        } else {
            true
        }
    });
    
    let removed = original_len - items.len();
    HttpResponse::Ok().json(serde_json::json!({
        "success": true,
        "message": format!("已清理 {} 个过期文件", removed),
        "removed_count": removed
    }))
}

async fn list_schedules(data: web::Data<AppState>) -> HttpResponse {
    let schedules = data.schedules.lock().unwrap();
    HttpResponse::Ok().json(&*schedules)
}

async fn create_schedule(
    data: web::Data<AppState>,
    req: web::Json<CreateScheduleRequest>,
) -> HttpResponse {
    let now = chrono::Utc::now();
    let schedule = SyncSchedule {
        id: format!("sch-{}", now.timestamp_millis()),
        folder_id: req.folder_id.clone(),
        folder_name: req.folder_name.clone(),
        folder_path: req.folder_path.clone(),
        schedule_type: req.schedule_type.clone(),
        enabled: req.enabled,
        weekdays: req.weekdays.clone(),
        time_range: req.time_range.clone(),
        interval_minutes: req.interval_minutes,
        last_run: None,
        next_run: None,
        created_at: now.to_rfc3339(),
        updated_at: now.to_rfc3339(),
    };
    
    let mut schedules = data.schedules.lock().unwrap();
    schedules.push(schedule.clone());
    HttpResponse::Created().json(schedule)
}

async fn update_schedule(
    data: web::Data<AppState>,
    path: web::Path<String>,
    req: web::Json<UpdateScheduleRequest>,
) -> HttpResponse {
    let schedule_id = path.into_inner();
    let now = chrono::Utc::now();
    let mut schedules = data.schedules.lock().unwrap();
    
    if let Some(pos) = schedules.iter().position(|s| s.id == schedule_id) {
        if let Some(folder_id) = &req.folder_id {
            schedules[pos].folder_id = folder_id.clone();
        }
        if let Some(folder_name) = &req.folder_name {
            schedules[pos].folder_name = folder_name.clone();
        }
        if let Some(folder_path) = &req.folder_path {
            schedules[pos].folder_path = folder_path.clone();
        }
        if let Some(schedule_type) = &req.schedule_type {
            schedules[pos].schedule_type = schedule_type.clone();
        }
        if let Some(enabled) = req.enabled {
            schedules[pos].enabled = enabled;
        }
        if let Some(weekdays) = &req.weekdays {
            schedules[pos].weekdays = weekdays.clone();
        }
        if let Some(time_range) = &req.time_range {
            schedules[pos].time_range = time_range.clone();
        }
        if let Some(interval_minutes) = req.interval_minutes {
            schedules[pos].interval_minutes = Some(interval_minutes);
        }
        schedules[pos].updated_at = now.to_rfc3339();
        
        HttpResponse::Ok().json(&schedules[pos])
    } else {
        HttpResponse::NotFound().json(serde_json::json!({
            "success": false,
            "message": "同步计划不存在"
        }))
    }
}

async fn delete_schedule(
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let schedule_id = path.into_inner();
    let mut schedules = data.schedules.lock().unwrap();
    
    if let Some(pos) = schedules.iter().position(|s| s.id == schedule_id) {
        schedules.remove(pos);
        HttpResponse::Ok().json(serde_json::json!({
            "success": true,
            "message": "同步计划已删除"
        }))
    } else {
        HttpResponse::NotFound().json(serde_json::json!({
            "success": false,
            "message": "同步计划不存在"
        }))
    }
}

async fn toggle_schedule(
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let schedule_id = path.into_inner();
    let now = chrono::Utc::now();
    let mut schedules = data.schedules.lock().unwrap();
    
    if let Some(pos) = schedules.iter().position(|s| s.id == schedule_id) {
        schedules[pos].enabled = !schedules[pos].enabled;
        schedules[pos].updated_at = now.to_rfc3339();
        HttpResponse::Ok().json(&schedules[pos])
    } else {
        HttpResponse::NotFound().json(serde_json::json!({
            "success": false,
            "message": "同步计划不存在"
        }))
    }
}

async fn run_schedule_now(
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let schedule_id = path.into_inner();
    let now = chrono::Utc::now();
    let mut schedules = data.schedules.lock().unwrap();
    
    if let Some(pos) = schedules.iter().position(|s| s.id == schedule_id) {
        let folder_id = schedules[pos].folder_id.clone();
        let execution = ScheduleExecution {
            id: format!("exe-{}", now.timestamp_millis()),
            schedule_id: schedule_id.clone(),
            folder_id,
            status: "running".to_string(),
            start_time: now.to_rfc3339(),
            end_time: None,
            files_synced: None,
            error_message: None,
        };
        
        let mut executions = data.schedule_executions.lock().unwrap();
        executions.insert(0, execution);
        
        schedules[pos].last_run = Some(now.to_rfc3339());
        
        HttpResponse::Ok().json(serde_json::json!({
            "success": true,
            "message": "同步任务已启动",
            "schedule_id": schedule_id
        }))
    } else {
        HttpResponse::NotFound().json(serde_json::json!({
            "success": false,
            "message": "同步计划不存在"
        }))
    }
}

async fn list_schedule_executions(data: web::Data<AppState>) -> HttpResponse {
    let executions = data.schedule_executions.lock().unwrap();
    HttpResponse::Ok().json(&*executions)
}

fn generate_token() -> String {
    use rand::Rng;
    const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let mut rng = rand::thread_rng();
    (0..16)
        .map(|_| {
            let idx = rng.gen_range(0..CHARSET.len());
            CHARSET[idx] as char
        })
        .collect()
}

async fn list_share_links(data: web::Data<AppState>) -> HttpResponse {
    let links = data.share_links.lock().unwrap();
    let now = chrono::Utc::now();
    let links_with_status: Vec<ShareLink> = links
        .iter()
        .map(|link| {
            let mut link = link.clone();
            if let Ok(expires) = chrono::DateTime::parse_from_rfc3339(&link.expires_at) {
                let expires_utc = expires.with_timezone(&chrono::Utc);
                let expired = now > expires_utc;
                let max_reached = link.max_access_count.map_or(false, |max| link.access_count >= max);
                link.is_active = link.is_active && !expired && !max_reached;
            }
            link
        })
        .collect();
    HttpResponse::Ok().json(&links_with_status)
}

async fn create_share_link(
    data: web::Data<AppState>,
    req: web::Json<CreateShareLinkRequest>,
) -> HttpResponse {
    let now = chrono::Utc::now();
    let expires_at = now + chrono::Duration::hours(req.expires_in_hours as i64);
    let token = generate_token();
    
    let link = ShareLink {
        id: format!("sl-{}", now.timestamp_millis()),
        token,
        file_id: req.file_id.clone(),
        file_name: req.file_name.clone(),
        file_path: req.file_path.clone(),
        version_id: req.version_id.clone(),
        version_number: req.version_number,
        size: req.size,
        hash: req.hash.clone(),
        created_by: req.created_by.clone(),
        created_at: now.to_rfc3339(),
        expires_at: expires_at.to_rfc3339(),
        access_count: 0,
        max_access_count: req.max_access_count,
        is_active: true,
    };
    
    let mut links = data.share_links.lock().unwrap();
    links.insert(0, link.clone());
    HttpResponse::Created().json(link)
}

async fn get_share_link(
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let link_id = path.into_inner();
    let links = data.share_links.lock().unwrap();
    
    if let Some(link) = links.iter().find(|l| l.id == link_id) {
        let mut link = link.clone();
        let now = chrono::Utc::now();
        if let Ok(expires) = chrono::DateTime::parse_from_rfc3339(&link.expires_at) {
            let expires_utc = expires.with_timezone(&chrono::Utc);
            let expired = now > expires_utc;
            let max_reached = link.max_access_count.map_or(false, |max| link.access_count >= max);
            link.is_active = link.is_active && !expired && !max_reached;
        }
        HttpResponse::Ok().json(&link)
    } else {
        HttpResponse::NotFound().json(serde_json::json!({
            "success": false,
            "message": "分享链接不存在"
        }))
    }
}

async fn update_share_link(
    data: web::Data<AppState>,
    path: web::Path<String>,
    req: web::Json<UpdateShareLinkRequest>,
) -> HttpResponse {
    let link_id = path.into_inner();
    let now = chrono::Utc::now();
    let mut links = data.share_links.lock().unwrap();
    
    if let Some(pos) = links.iter().position(|l| l.id == link_id) {
        if let Some(is_active) = req.is_active {
            links[pos].is_active = is_active;
        }
        if let Some(expires_at) = &req.expires_at {
            links[pos].expires_at = expires_at.clone();
        }
        if let Some(max_access_count) = req.max_access_count {
            links[pos].max_access_count = Some(max_access_count);
        }
        
        HttpResponse::Ok().json(&links[pos])
    } else {
        HttpResponse::NotFound().json(serde_json::json!({
            "success": false,
            "message": "分享链接不存在"
        }))
    }
}

async fn delete_share_link(
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let link_id = path.into_inner();
    let mut links = data.share_links.lock().unwrap();
    
    if let Some(pos) = links.iter().position(|l| l.id == link_id) {
        links.remove(pos);
        HttpResponse::Ok().json(serde_json::json!({
            "success": true,
            "message": "分享链接已删除"
        }))
    } else {
        HttpResponse::NotFound().json(serde_json::json!({
            "success": false,
            "message": "分享链接不存在"
        }))
    }
}

async fn access_share_link(
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let token = path.into_inner();
    let now = chrono::Utc::now();
    let mut links = data.share_links.lock().unwrap();
    
    if let Some(pos) = links.iter().position(|l| l.token == token) {
        let mut link = links[pos].clone();
        
        if !link.is_active {
            return HttpResponse::Ok().json(ShareLinkAccessResult {
                valid: false,
                message: "分享链接已被禁用".to_string(),
                share_link: None,
            });
        }
        
        if let Ok(expires) = chrono::DateTime::parse_from_rfc3339(&link.expires_at) {
            let expires_utc = expires.with_timezone(&chrono::Utc);
            if now > expires_utc {
                links[pos].is_active = false;
                return HttpResponse::Ok().json(ShareLinkAccessResult {
                    valid: false,
                    message: "分享链接已过期".to_string(),
                    share_link: None,
                });
            }
        }
        
        if let Some(max) = link.max_access_count {
            if link.access_count >= max {
                links[pos].is_active = false;
                return HttpResponse::Ok().json(ShareLinkAccessResult {
                    valid: false,
                    message: "分享链接已达到最大访问次数".to_string(),
                    share_link: None,
                });
            }
        }
        
        links[pos].access_count += 1;
        link.access_count = links[pos].access_count;
        
        HttpResponse::Ok().json(ShareLinkAccessResult {
            valid: true,
            message: "访问成功".to_string(),
            share_link: Some(link),
        })
    } else {
        HttpResponse::NotFound().json(ShareLinkAccessResult {
            valid: false,
            message: "分享链接不存在".to_string(),
            share_link: None,
        })
    }
}

async fn list_file_share_links(
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let file_id = path.into_inner();
    let links = data.share_links.lock().unwrap();
    let now = chrono::Utc::now();
    
    let file_links: Vec<ShareLink> = links
        .iter()
        .filter(|l| l.file_id == file_id)
        .map(|link| {
            let mut link = link.clone();
            if let Ok(expires) = chrono::DateTime::parse_from_rfc3339(&link.expires_at) {
                let expires_utc = expires.with_timezone(&chrono::Utc);
                let expired = now > expires_utc;
                let max_reached = link.max_access_count.map_or(false, |max| link.access_count >= max);
                link.is_active = link.is_active && !expired && !max_reached;
            }
            link
        })
        .collect();
    
    HttpResponse::Ok().json(&file_links)
}

async fn list_daily_sync_reports(data: web::Data<AppState>) -> HttpResponse {
    let reports = data.daily_sync_reports.lock().unwrap();
    let sorted: Vec<&DailySyncReport> = reports.iter().take(30).collect();
    HttpResponse::Ok().json(&sorted)
}

async fn get_daily_sync_report(
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let report_id = path.into_inner();
    let reports = data.daily_sync_reports.lock().unwrap();
    
    if let Some(report) = reports.iter().find(|r| r.id == report_id) {
        HttpResponse::Ok().json(report)
    } else {
        HttpResponse::NotFound().json(serde_json::json!({
            "success": false,
            "message": "日报不存在"
        }))
    }
}

async fn mark_daily_sync_report_as_read(
    data: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let report_id = path.into_inner();
    let mut reports = data.daily_sync_reports.lock().unwrap();
    
    if let Some(pos) = reports.iter().position(|r| r.id == report_id) {
        reports[pos].read = true;
        HttpResponse::Ok().json(&reports[pos])
    } else {
        HttpResponse::NotFound().json(serde_json::json!({
            "success": false,
            "message": "日报不存在"
        }))
    }
}

async fn mark_all_daily_sync_reports_as_read(data: web::Data<AppState>) -> HttpResponse {
    let mut reports = data.daily_sync_reports.lock().unwrap();
    for report in reports.iter_mut() {
        report.read = true;
    }
    HttpResponse::Ok().json(serde_json::json!({
        "success": true,
        "message": "所有日报已标记为已读"
    }))
}

async fn generate_daily_sync_report(
    data: web::Data<AppState>,
    req: web::Json<GenerateDailyReportRequest>,
) -> HttpResponse {
    let now = chrono::Utc::now();
    let today = now.format("%Y-%m-%d").to_string();
    
    let report = DailySyncReport {
        id: format!("dsr-{}", now.timestamp_millis()),
        date: today,
        device_id: req.device_id.clone(),
        device_name: req.device_id.clone(),
        summary: SyncResultSummary {
            added: 0,
            modified: 0,
            deleted: 0,
            conflicted: 0,
            failed: 0,
            retried: 0,
            total_size: 0,
        },
        details: SyncResultDetail {
            added_files: Vec::new(),
            modified_files: Vec::new(),
            deleted_files: Vec::new(),
            conflicted_files: Vec::new(),
            failed_files: Vec::new(),
            retried_files: Vec::new(),
        },
        generated_at: now.to_rfc3339(),
        read: false,
    };
    
    let mut reports = data.daily_sync_reports.lock().unwrap();
    reports.insert(0, report.clone());
    HttpResponse::Created().json(report)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();
    println!("Starting FileSync server on port 8080");
    
    let app_state = web::Data::new(AppState {
        recycle_bin: Mutex::new(Vec::new()),
        schedules: Mutex::new(Vec::new()),
        schedule_executions: Mutex::new(Vec::new()),
        share_links: Mutex::new(Vec::new()),
        daily_sync_reports: Mutex::new(Vec::new()),
    });
    
    HttpServer::new(move || {
        let cors = Cors::default().allow_any_origin().allow_any_method().allow_any_header();
        App::new()
            .wrap(cors)
            .app_data(app_state.clone())
            .route("/api/health", web::get().to(health))
            .route("/api/files", web::get().to(list_files))
            .route("/api/sync/{folder_id}", web::post().to(sync_folder))
            .route("/api/recycle-bin", web::get().to(list_recycle_bin))
            .route("/api/recycle-bin", web::post().to(add_to_recycle_bin))
            .route("/api/recycle-bin/{item_id}/restore", web::post().to(restore_from_recycle_bin))
            .route("/api/recycle-bin/{item_id}", web::delete().to(delete_from_recycle_bin))
            .route("/api/recycle-bin/clear-expired", web::post().to(clear_expired_recycle_bin))
            .route("/api/schedules", web::get().to(list_schedules))
            .route("/api/schedules", web::post().to(create_schedule))
            .route("/api/schedules/{schedule_id}", web::put().to(update_schedule))
            .route("/api/schedules/{schedule_id}", web::delete().to(delete_schedule))
            .route("/api/schedules/{schedule_id}/toggle", web::post().to(toggle_schedule))
            .route("/api/schedules/{schedule_id}/run", web::post().to(run_schedule_now))
            .route("/api/schedule-executions", web::get().to(list_schedule_executions))
            .route("/api/share-links", web::get().to(list_share_links))
            .route("/api/share-links", web::post().to(create_share_link))
            .route("/api/share-links/{link_id}", web::get().to(get_share_link))
            .route("/api/share-links/{link_id}", web::put().to(update_share_link))
            .route("/api/share-links/{link_id}", web::delete().to(delete_share_link))
            .route("/api/share-links/access/{token}", web::get().to(access_share_link))
            .route("/api/share-links/file/{file_id}", web::get().to(list_file_share_links))
            .route("/api/daily-sync-reports", web::get().to(list_daily_sync_reports))
            .route("/api/daily-sync-reports", web::post().to(generate_daily_sync_report))
            .route("/api/daily-sync-reports/{report_id}", web::get().to(get_daily_sync_report))
            .route("/api/daily-sync-reports/{report_id}/read", web::post().to(mark_daily_sync_report_as_read))
            .route("/api/daily-sync-reports/mark-all-read", web::post().to(mark_all_daily_sync_reports_as_read))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
