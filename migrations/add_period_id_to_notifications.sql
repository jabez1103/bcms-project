-- ============================================================
-- Add clearance_period_id to notifications table
-- Links each notification to a specific clearance period
-- so that only current-cycle notifications are shown in the UI.
-- ============================================================

ALTER TABLE notifications ADD COLUMN clearance_period_id INT DEFAULT NULL AFTER target_id;
ALTER TABLE notifications ADD INDEX idx_notifications_period (clearance_period_id);
