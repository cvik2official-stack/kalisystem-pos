/*
  # Update RLS Policies for Anonymous Access

  ## Overview
  Updates Row Level Security policies to allow anonymous (unauthenticated) users to read data
  while keeping write operations restricted to authenticated users.

  ## Changes

  ### Items Table
  - Update SELECT policy to allow both anonymous and authenticated users
  - Keep INSERT, UPDATE, DELETE restricted to authenticated users only

  ### Categories Table
  - Update SELECT policy to allow anonymous read access
  - Keep write operations restricted to authenticated users

  ### Suppliers Table
  - Update SELECT policy to allow anonymous read access
  - Keep write operations restricted to authenticated users

  ### Measure Units Table
  - Update SELECT policy to allow anonymous read access
  - Keep write operations restricted to authenticated users

  ## Security Notes
  - Anonymous users can only READ data from reference tables
  - All write operations (INSERT, UPDATE, DELETE) require authentication
  - This allows the app to display inventory without requiring login
  - User-specific data (carts, orders) remains protected
*/

-- Drop existing policies for items table
DROP POLICY IF EXISTS "Anyone can view items" ON items;
DROP POLICY IF EXISTS "Authenticated users can create items" ON items;
DROP POLICY IF EXISTS "Authenticated users can update items" ON items;
DROP POLICY IF EXISTS "Authenticated users can delete items" ON items;

-- Create updated policies for items table
CREATE POLICY "Anyone can view items"
  ON items FOR SELECT
  TO anon, authenticated
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

-- Update categories table policies
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can create categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON categories;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Update suppliers table policies
DROP POLICY IF EXISTS "Anyone can view suppliers" ON suppliers;
DROP POLICY IF EXISTS "Authenticated users can create suppliers" ON suppliers;
DROP POLICY IF EXISTS "Authenticated users can update suppliers" ON suppliers;
DROP POLICY IF EXISTS "Authenticated users can delete suppliers" ON suppliers;

CREATE POLICY "Anyone can view suppliers"
  ON suppliers FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create suppliers"
  ON suppliers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update suppliers"
  ON suppliers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete suppliers"
  ON suppliers FOR DELETE
  TO authenticated
  USING (true);

-- Update measure_units table policies
DROP POLICY IF EXISTS "Anyone can view measure units" ON measure_units;
DROP POLICY IF EXISTS "Authenticated users can create measure units" ON measure_units;
DROP POLICY IF EXISTS "Authenticated users can update measure units" ON measure_units;
DROP POLICY IF EXISTS "Authenticated users can delete measure units" ON measure_units;

CREATE POLICY "Anyone can view measure units"
  ON measure_units FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create measure units"
  ON measure_units FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update measure units"
  ON measure_units FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete measure units"
  ON measure_units FOR DELETE
  TO authenticated
  USING (true);