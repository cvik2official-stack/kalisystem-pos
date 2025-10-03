/*
  # Update Suppliers Table Schema
  
  1. Changes
    - Remove `color` column
    - Remove `email` column and add `group_chat_id` (bigint) for Telegram group ID
    - Rename `contact` column to `supplier_contact` for Telegram username
    - Add `location` column (text) for location URL
    - Add `qr_code` column (text) for QR code URL
    - Add `price_list` column (text) for price list URL  
    - Add `tags` column (text[]) for supplier tags
  
  2. Security
    - Maintain existing RLS policies
*/

-- Remove color column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'suppliers' AND column_name = 'color'
  ) THEN
    ALTER TABLE suppliers DROP COLUMN color;
  END IF;
END $$;

-- Replace email with group_chat_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'suppliers' AND column_name = 'email'
  ) THEN
    ALTER TABLE suppliers DROP COLUMN email;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'suppliers' AND column_name = 'group_chat_id'
  ) THEN
    ALTER TABLE suppliers ADD COLUMN group_chat_id bigint;
  END IF;
END $$;

-- Rename contact to supplier_contact
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'suppliers' AND column_name = 'contact'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'suppliers' AND column_name = 'supplier_contact'
  ) THEN
    ALTER TABLE suppliers RENAME COLUMN contact TO supplier_contact;
  END IF;
END $$;

-- Add new columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'suppliers' AND column_name = 'location'
  ) THEN
    ALTER TABLE suppliers ADD COLUMN location text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'suppliers' AND column_name = 'qr_code'
  ) THEN
    ALTER TABLE suppliers ADD COLUMN qr_code text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'suppliers' AND column_name = 'price_list'
  ) THEN
    ALTER TABLE suppliers ADD COLUMN price_list text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'suppliers' AND column_name = 'tags'
  ) THEN
    ALTER TABLE suppliers ADD COLUMN tags text[] DEFAULT '{}';
  END IF;
END $$;