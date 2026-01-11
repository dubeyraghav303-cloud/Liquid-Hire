-- Enable RLS on interviews table
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to ensure clean state
DROP POLICY IF EXISTS "Users can view own interviews" ON interviews;
DROP POLICY IF EXISTS "Users can insert own interviews" ON interviews;
DROP POLICY IF EXISTS "Users can update own interviews" ON interviews;

-- Create policy for SELECT (view own interviews)
CREATE POLICY "Users can view own interviews"
ON interviews
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy for INSERT (add own interviews)
CREATE POLICY "Users can insert own interviews"
ON interviews
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policy for UPDATE (if needed, e.g. future edits)
CREATE POLICY "Users can update own interviews"
ON interviews
FOR UPDATE
USING (auth.uid() = user_id);

-- Explicitly grant permissions to authenticated role (safeguard)
GRANT SELECT, INSERT, UPDATE ON interviews TO authenticated;
