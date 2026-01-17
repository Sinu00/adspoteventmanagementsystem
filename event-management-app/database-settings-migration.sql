-- Settings Table Migration
-- Run this in your Supabase SQL Editor

-- Settings Table for storing application configuration
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default event limit setting
INSERT INTO settings (key, value, description)
VALUES ('event_limit_per_day', '4', 'Maximum number of events allowed per day')
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to read settings"
  ON settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update settings"
  ON settings FOR UPDATE
  TO authenticated
  USING (true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
