/*
  # Fix Order Creation Policies

  ## Overview
  Updates RLS policies to allow anonymous users to create orders and order items
  for the Telegram mini app functionality.

  ## Changes
  1. Update orders table policies to allow anonymous inserts
  2. Update order_items table policies to allow anonymous inserts
  3. Ensure the order number generation function works properly

  ## Security Notes
  - Anonymous users can only create orders, not read/update/delete others' orders
  - This is necessary for the Telegram mini app to work without authentication
*/

-- Update orders table policies for anonymous access
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can view orders" ON orders;
DROP POLICY IF EXISTS "Users can update orders" ON orders;

-- Allow anonymous users to create orders (for Telegram mini app)
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users to view orders
CREATE POLICY "Authenticated users can view orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update orders
CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Update order_items table policies for anonymous access
DROP POLICY IF EXISTS "Users can create order items" ON order_items;
DROP POLICY IF EXISTS "Users can view order items" ON order_items;
DROP POLICY IF EXISTS "Users can update order items" ON order_items;

-- Allow anonymous users to create order items (for Telegram mini app)
CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users to view order items
CREATE POLICY "Authenticated users can view order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update order items
CREATE POLICY "Authenticated users can update order items"
  ON order_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure the order number generation function is accessible
GRANT EXECUTE ON FUNCTION generate_order_number() TO anon, authenticated;