-- ============================================================
-- Add program column to signatories table
-- Allows associating signatories (especially Deans) with a
-- specific academic program for visibility rules.
-- ============================================================

ALTER TABLE signatories ADD COLUMN assigned_program VARCHAR(20) DEFAULT NULL AFTER department;
