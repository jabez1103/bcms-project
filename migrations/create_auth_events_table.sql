-- Migration: create auth_events table
-- Run this in phpMyAdmin on student_clearance_db_2

CREATE TABLE IF NOT EXISTS auth_events (
  event_id    INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id     INT             NOT NULL,
  event_type  ENUM('login', 'logout', 'password_changed') NOT NULL,
  ip_address  VARCHAR(45)     DEFAULT NULL,
  user_agent  TEXT            DEFAULT NULL,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (event_id),
  KEY idx_auth_events_user (user_id),
  CONSTRAINT fk_auth_events_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
