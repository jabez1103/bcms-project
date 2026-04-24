-- Migration: add allow_comment column to requirements
-- Run this in phpMyAdmin on student_clearance_db_2

ALTER TABLE requirements
  ADD COLUMN allow_comment TINYINT(1) NOT NULL DEFAULT 0
  COMMENT '1 = student may attach a comment when submitting, 0 = no comment field shown';
