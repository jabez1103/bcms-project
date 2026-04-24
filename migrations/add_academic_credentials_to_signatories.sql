-- Add academic_credentials column to signatories table
ALTER TABLE signatories
  ADD COLUMN IF NOT EXISTS academic_credentials VARCHAR(50) NULL
  AFTER department;
