-- Add target_id to notifications so the frontend knows where to navigate on click.
-- Run this in phpMyAdmin against student_clearance_db_2.

ALTER TABLE notifications
  ADD COLUMN target_id INT NULL AFTER message;
