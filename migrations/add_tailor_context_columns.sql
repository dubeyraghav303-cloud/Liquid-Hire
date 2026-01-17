-- Add context_json and experience_json columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS context_json JSONB,
ADD COLUMN IF NOT EXISTS experience_json JSONB;

-- Comment on columns
COMMENT ON COLUMN profiles.context_json IS 'Stores extracted context from resume for tailoring';
COMMENT ON COLUMN profiles.experience_json IS 'Stores extracted experience items from resume for tailoring';
