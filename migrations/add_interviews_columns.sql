-- Add missing columns to interviews table
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS job_role text;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS score integer;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS summary text;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS json_report jsonb;
