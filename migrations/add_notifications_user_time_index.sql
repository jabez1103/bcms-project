-- Speeds newest-first fetch and trim-to-10 operations per user
CREATE INDEX idx_notifications_user_time_id
  ON notifications (user_id, created_at DESC, notification_id DESC);
