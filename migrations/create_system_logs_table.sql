-- Admin-facing application/system log table
CREATE TABLE IF NOT EXISTS system_logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(32) NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_system_logs_created (created_at DESC, log_id DESC),
  INDEX idx_system_logs_type_created (type, created_at DESC, log_id DESC)
);
