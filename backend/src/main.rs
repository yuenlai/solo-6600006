use actix_web::{web, App, HttpServer, HttpResponse};
use actix_cors::Cors;
use serde::Serialize;

mod models;
mod services;

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

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();
    println!("Starting FileSync server on port 8080");
    HttpServer::new(|| {
        let cors = Cors::default().allow_any_origin().allow_any_method().allow_any_header();
        App::new()
            .wrap(cors)
            .route("/api/health", web::get().to(health))
            .route("/api/files", web::get().to(list_files))
            .route("/api/sync/{folder_id}", web::post().to(sync_folder))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
