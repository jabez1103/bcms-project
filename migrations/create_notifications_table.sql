-- ============================================================
-- Notifications table for BCMS
-- Run this once against your student_clearance_db_2 database.
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT          AUTO_INCREMENT PRIMARY KEY,
  user_id         INT          NOT NULL,
  role            ENUM('student', 'admin', 'signatory') NOT NULL,
  type            VARCHAR(50)  NOT NULL,   -- submission_received | submission_approved | submission_rejected | period_opened | period_closed
  title           VARCHAR(255) NOT NULL,
  message         TEXT         NOT NULL,
  is_read         TINYINT(1)   NOT NULL DEFAULT 0,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_unread (user_id, is_read)
);
