/*
  # Create Tags Table

  ## Overview
  Creates a tags table for managing brand tags and other custom tags in the system.

  ## New Tables

  ### tags
  - `id` (uuid, primary key)
  - `name` (text) - Tag name
  - `color` (text) - Display color
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on tags table
  - Allow anonymous and authenticated users to read tags
  - Restrict write operations to authenticated users only

  ## Important Notes
  - This table stores brand tags and other custom tags
  - Tags can be referenced by items for categorization
*/

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL DEFAULT '#gray',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tags"
  ON tags FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create tags"
  ON tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tags"
  ON tags FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tags"
  ON tags FOR DELETE
  TO authenticated
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
