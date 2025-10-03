/*
  # Remove Measure Units Table

  ## Overview
  Removes the measure_units table as measure units are now managed through the tags system
  with the 'measure_unit' category. All measure unit data has already been migrated to the
  tags table in a previous migration (20251003040600_cleanup_schema_and_add_tag_categories.sql).

  ## Changes
  1. Drop measure_units table and all associated objects
     - Drop all RLS policies on measure_units
     - Drop all indexes on measure_units
     - Drop the measure_units table itself

  ## Data Safety
  - This is safe because measure units were already migrated to tags table
  - The tags table contains all measure unit data with metadata preserving:
    - full_name (original name)
    - type (weight, volume, length, count, time)
    - base_unit (conversion reference)
    - conversion_factor (conversion multiplier)

  ## Important Notes
  - Measure units are now accessed via tags table with category_id = 'measure_unit'
  - No data loss occurs as migration already completed
  - Frontend components will use tags system for measure unit management
*/

-- Drop all policies on measure_units table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'measure_units'
  ) THEN
    DROP POLICY IF EXISTS "Anyone can view measure units" ON measure_units;
    DROP POLICY IF EXISTS "Authenticated users can create measure units" ON measure_units;
    DROP POLICY IF EXISTS "Authenticated users can update measure units" ON measure_units;
    DROP POLICY IF EXISTS "Authenticated users can delete measure units" ON measure_units;
  END IF;
END $$;

-- Drop indexes on measure_units
DROP INDEX IF EXISTS idx_measure_units_type;

-- Drop the measure_units table
DROP TABLE IF EXISTS measure_units CASCADE;
