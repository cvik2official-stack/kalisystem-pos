/*
  # Fix RLS Policies for Telegram Mini App

  ## Overview
  Adjusts RLS policies to properly support the Telegram mini app functionality
  while maintaining security. The mini app needs to create orders and carts
  without authentication, but we still want to protect data access.

  ## Changes
  1. Allow anonymous users to INSERT into orders, order_items, carts, cart_items
  2. Restrict SELECT/UPDATE/DELETE to authenticated users only
  3. Add service role policies for edge functions

  ## Security Notes
  - Anonymous users can only create data, not read/modify existing data
  - This allows the Telegram mini app to function while maintaining security
  - Service role has full access for edge functions
*/

-- Orders table policies
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can view orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;

CREATE POLICY "Anonymous can create orders"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated can manage orders"
  ON orders FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage orders"
  ON orders FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Order items table policies
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;
DROP POLICY IF EXISTS "Authenticated users can view order items" ON order_items;
DROP POLICY IF EXISTS "Authenticated users can update order items" ON order_items;

CREATE POLICY "Anonymous can create order items"
  ON order_items FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated can manage order items"
  ON order_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage order items"
  ON order_items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Carts table policies
DROP POLICY IF EXISTS "Anyone can create carts" ON carts;
DROP POLICY IF EXISTS "Authenticated users can view carts" ON carts;
DROP POLICY IF EXISTS "Authenticated users can update carts" ON carts;
DROP POLICY IF EXISTS "Authenticated users can delete carts" ON carts;

CREATE POLICY "Anonymous can create carts"
  ON carts FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated can manage carts"
  ON carts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage carts"
  ON carts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Cart items table policies
DROP POLICY IF EXISTS "Anyone can create cart items" ON cart_items;
DROP POLICY IF EXISTS "Authenticated users can view cart items" ON cart_items;
DROP POLICY IF EXISTS "Authenticated users can update cart items" ON cart_items;
DROP POLICY IF EXISTS "Authenticated users can delete cart items" ON cart_items;

CREATE POLICY "Anonymous can create cart items"
  ON cart_items FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated can manage cart items"
  ON cart_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage cart items"
  ON cart_items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure service role can execute functions
GRANT EXECUTE ON FUNCTION generate_order_number() TO service_role;
GRANT EXECUTE ON FUNCTION set_order_number() TO service_role;
GRANT EXECUTE ON FUNCTION update_updated_at() TO service_role;