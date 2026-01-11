-- Add json_report column to interviews table
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS json_report jsonb;
