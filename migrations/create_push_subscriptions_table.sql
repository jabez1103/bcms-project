-- ============================================================
-- Push subscriptions table for browser push notifications
-- Run this once against your student_clearance_db_2 database.
-- ============================================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  subscription_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh VARCHAR(255) NOT NULL,
  auth VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_push_endpoint (endpoint(255)),
  INDEX idx_push_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
