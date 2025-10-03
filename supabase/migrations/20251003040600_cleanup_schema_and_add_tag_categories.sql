/*
  # Schema Cleanup and Tag Categories Implementation
  
  1. Changes
    - Remove icon column from categories table (icon is included in name)
    - Delete profiles table (not needed)
    - Delete supplier_groups table (redundant with suppliers table)
    - Create tag_categories table for organizing tags
    - Convert measure_units to tags system with tag_category reference
    - Keep supplier_items table structure for future use
  
  2. Security
    - Maintain RLS policies where applicable
*/

-- Remove icon column from categories
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'icon'
  ) THEN
    ALTER TABLE categories DROP COLUMN icon;
  END IF;
END $$;

-- Drop profiles table
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop supplier_groups table
DROP TABLE IF EXISTS supplier_groups CASCADE;

-- Create tag_categories table
CREATE TABLE IF NOT EXISTS tag_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  color text DEFAULT '#gray',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tag_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access to tag_categories"
  ON tag_categories FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated read access to tag_categories"
  ON tag_categories FOR SELECT
  TO authenticated
  USING (true);

-- Update tags table to reference tag_category
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tags' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE tags ADD COLUMN category_id uuid REFERENCES tag_categories(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tags' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE tags ADD COLUMN metadata jsonb DEFAULT '{}';
  END IF;
END $$;

-- Insert default tag categories
INSERT INTO tag_categories (name, description, color) VALUES
  ('measure_unit', 'Measurement units for items', '#blue'),
  ('brand', 'Brand tags for products', '#green'),
  ('quality', 'Quality indicators', '#orange')
ON CONFLICT (name) DO NOTHING;

-- Migrate measure_units to tags
DO $$
DECLARE
  measure_cat_id uuid;
  unit_record RECORD;
BEGIN
  -- Get measure_unit category id
  SELECT id INTO measure_cat_id FROM tag_categories WHERE name = 'measure_unit';
  
  -- Check if measure_units table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'measure_units') THEN
    -- Migrate each measure unit to tags
    FOR unit_record IN SELECT * FROM measure_units LOOP
      INSERT INTO tags (name, color, category_id, metadata)
      VALUES (
        unit_record.symbol,
        '#3498db',
        measure_cat_id,
        jsonb_build_object(
          'full_name', unit_record.name,
          'type', unit_record.type,
          'base_unit', unit_record.base_unit,
          'conversion_factor', unit_record.conversion_factor
        )
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END $$;