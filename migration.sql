-- SQL Migration to ensure transactions table has a date column
-- Use this in your Supabase SQL Editor

ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS date date DEFAULT CURRENT_DATE;

-- Optional: Update existing records that might have null date but have created_at
UPDATE transactions 
SET date = created_at::date 
WHERE date IS NULL;
