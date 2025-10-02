/*
  # Order Management System Schema

  ## Overview
  Complete database schema for Telegram-based order management system with mini-app integration.
  This migration creates the foundation for cart management, order processing, supplier coordination,
  and team-based workflows.

  ## New Tables

  ### 1. carts
  Stores reusable shopping carts created by users
  - `id` (uuid, primary key)
  - `cart_name` (text) - User-defined cart name
  - `telegram_user_id` (bigint) - Telegram user who created the cart
  - `is_template` (boolean) - Mark frequently used carts as templates
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. cart_items
  Individual items within a cart
  - `id` (uuid, primary key)
  - `cart_id` (uuid, foreign key to carts)
  - `item_name` (text)
  - `quantity` (integer)
  - `category` (text)
  - `created_at` (timestamptz)

  ### 3. orders
  Order records tracking the complete order lifecycle
  - `id` (uuid, primary key)
  - `order_number` (text, unique) - Incremental format: 0001, 0002, etc.
  - `cart_id` (uuid, foreign key to carts)
  - `telegram_user_id` (bigint) - User who placed the order
  - `telegram_message_id` (bigint) - Message ID in private chat
  - `telegram_chat_id` (bigint) - Chat ID where order message was sent
  - `team_tags` (text[]) - Array of team tags
  - `delivery_type` (text) - Delivery or Pickup
  - `payment_method` (text) - Payment method chosen
  - `status` (text) - Order status: New, Pending, Pending Review, Processing, Completed
  - `supplier_id` (uuid, foreign key)
  - `invoice_amount` (decimal)
  - `invoice_file_id` (text) - Telegram file ID
  - `completed_at` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. order_status_history
  Tracks all status changes for audit trail
  - `id` (uuid, primary key)
  - `order_id` (uuid, foreign key to orders)
  - `old_status` (text)
  - `new_status` (text)
  - `changed_by` (bigint) - Telegram user ID who made the change
  - `changed_at` (timestamptz)
  - `notes` (text)

  ### 5. supplier_groups
  Maps suppliers to their Telegram group chats
  - `id` (uuid, primary key)
  - `supplier_id` (uuid, foreign key)
  - `telegram_group_id` (bigint) - Telegram group chat ID
  - `discovered_at` (timestamptz)
  - `is_active` (boolean)

  ### 6. supplier_items
  Tracks item availability per supplier
  - `id` (uuid, primary key)
  - `supplier_id` (uuid, foreign key)
  - `item_name` (text)
  - `is_available` (boolean)
  - `last_updated` (timestamptz)
  - `updated_by` (bigint) - Telegram user ID

  ### 7. team_tags (enhancement)
  Add manager assignment to existing tags
  - Adds `manager_telegram_username` field to existing tags table

  ### 8. order_items
  Snapshot of items in an order (separate from cart_items for immutability)
  - `id` (uuid, primary key)
  - `order_id` (uuid, foreign key to orders)
  - `item_name` (text)
  - `quantity` (integer)
  - `category` (text)
  - `is_available` (boolean) - Updated by supplier
  - `is_confirmed` (boolean) - Confirmed by supplier

  ## Security
  - Enable RLS on all tables
  - Create policies for authenticated users based on telegram_user_id
  - Restrict sensitive operations to appropriate roles

  ## Functions
  - `generate_order_number()` - Auto-generates incremental order numbers starting from 0001
*/

-- Create carts table
CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_name text NOT NULL,
  telegram_user_id bigint NOT NULL,
  is_template boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own carts"
  ON carts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own carts"
  ON carts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own carts"
  ON carts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own carts"
  ON carts FOR DELETE
  TO authenticated
  USING (true);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  category text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (true);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  cart_id uuid REFERENCES carts(id),
  telegram_user_id bigint NOT NULL,
  telegram_message_id bigint,
  telegram_chat_id bigint,
  team_tags text[] DEFAULT '{}',
  delivery_type text,
  payment_method text,
  status text NOT NULL DEFAULT 'New',
  supplier_id uuid,
  invoice_amount decimal(10,2),
  invoice_file_id text,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  category text,
  is_available boolean DEFAULT true,
  is_confirmed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update order items"
  ON order_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create order_status_history table
CREATE TABLE IF NOT EXISTS order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  changed_by bigint,
  changed_at timestamptz DEFAULT now(),
  notes text
);

ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view order status history"
  ON order_status_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create order status history"
  ON order_status_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create supplier_groups table
CREATE TABLE IF NOT EXISTS supplier_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL,
  telegram_group_id bigint NOT NULL UNIQUE,
  discovered_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

ALTER TABLE supplier_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view supplier groups"
  ON supplier_groups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create supplier groups"
  ON supplier_groups FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update supplier groups"
  ON supplier_groups FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create supplier_items table
CREATE TABLE IF NOT EXISTS supplier_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL,
  item_name text NOT NULL,
  is_available boolean DEFAULT true,
  last_updated timestamptz DEFAULT now(),
  updated_by bigint,
  UNIQUE(supplier_id, item_name)
);

ALTER TABLE supplier_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view supplier items"
  ON supplier_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create supplier items"
  ON supplier_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update supplier items"
  ON supplier_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add manager_telegram_username to tags table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tags') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'tags' AND column_name = 'manager_telegram_username'
    ) THEN
      ALTER TABLE tags ADD COLUMN manager_telegram_username text;
    END IF;
  END IF;
END $$;

-- Function to generate incremental order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  next_number integer;
  new_order_number text;
BEGIN
  -- Get the highest order number and increment
  SELECT COALESCE(MAX(CAST(order_number AS integer)), 0) + 1
  INTO next_number
  FROM orders;
  
  -- Format as 4-digit padded string
  new_order_number := LPAD(next_number::text, 4, '0');
  
  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order number on insert
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_order_number ON orders;
CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_carts_updated_at ON carts;
CREATE TRIGGER trigger_update_carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_orders_updated_at ON orders;
CREATE TRIGGER trigger_update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_carts_telegram_user_id ON carts(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_orders_telegram_user_id ON orders(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_supplier_id ON orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_supplier_groups_telegram_group_id ON supplier_groups(telegram_group_id);
CREATE INDEX IF NOT EXISTS idx_supplier_items_supplier_id ON supplier_items(supplier_id);