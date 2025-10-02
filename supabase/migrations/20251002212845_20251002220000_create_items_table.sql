/*
  # Create Items Table

  ## Overview
  Creates the main items table for storing inventory/product data.

  ## New Tables

  ### items
  Master inventory table
  - `id` (uuid, primary key)
  - `item_name` (text) - Name of the item
  - `category` (text) - Item category
  - `default_supplier` (text) - Primary supplier name
  - `supplier_alternative` (text) - Alternative supplier
  - `order_quantity` (text) - Standard order quantity
  - `measure_unit` (text) - Unit of measurement
  - `default_quantity` (text) - Default quantity
  - `brand_tag` (text) - Brand or tag information
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on items table
  - Allow all authenticated users to read items
  - Allow authenticated users to manage items

  ## Important Notes
  - This is the primary inventory table
  - Data will be synced with Google Sheets
*/

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name text NOT NULL,
  category text,
  default_supplier text,
  supplier_alternative text,
  order_quantity text,
  measure_unit text,
  default_quantity text,
  brand_tag text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view items"
  ON items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create items"
  ON items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update items"
  ON items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete items"
  ON items FOR DELETE
  TO authenticated
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_supplier ON items(default_supplier);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at);
