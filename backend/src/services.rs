use sha2::{Sha256, Digest};
use std::fs;

pub fn compute_file_hash(path: &str) -> Result<String, std::io::Error> {
    let data = fs::read(path)?;
    let mut hasher = Sha256::new();
    hasher.update(&data);
    Ok(hex::encode(hasher.finalize()))
}

pub fn compute_delta(old_hash: &str, new_hash: &str) -> bool {
    old_hash != new_hash
}
