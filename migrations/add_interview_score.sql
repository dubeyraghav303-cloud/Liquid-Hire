-- Add score and summary columns to interviews table
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS score integer;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS summary text;
