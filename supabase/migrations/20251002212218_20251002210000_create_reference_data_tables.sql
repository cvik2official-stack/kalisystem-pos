/*
  # Create Reference Data Tables

  ## Overview
  Creates tables for storing reference data that was previously in local files:
  categories, suppliers, users/profiles, teams, and measure units.

  ## New Tables

  ### 1. categories
  Hierarchical category structure with parent-child relationships
  - `id` (uuid, primary key)
  - `name` (text) - Category name
  - `color` (text) - Display color
  - `icon` (text) - Emoji or icon identifier
  - `parent_id` (uuid, nullable) - Reference to parent category
  - `level` (text) - Hierarchy level: parent, main, category, subcategory
  - `order_number` (integer) - Sort order within level
  - `created_at` (timestamptz)

  ### 2. suppliers
  Supplier contact information and settings
  - `id` (uuid, primary key)
  - `name` (text) - Supplier name
  - `contact` (text) - Phone number
  - `email` (text) - Email address
  - `color` (text) - Display color
  - `active` (boolean) - Whether supplier is currently active
  - `categories` (text[]) - Array of category IDs this supplier handles
  - `created_at` (timestamptz)

  ### 3. profiles
  User profiles for team members
  - `id` (uuid, primary key)
  - `telegram_user_id` (bigint, unique) - Telegram user ID
  - `name` (text) - Display name
  - `role` (text) - Role: admin, manager, driver, supplier, owner
  - `team_id` (uuid) - Reference to team
  - `color` (text) - Display color
  - `active` (boolean) - Whether user is currently active
  - `created_at` (timestamptz)

  ### 4. teams
  Team organization structure
  - `id` (uuid, primary key)
  - `name` (text) - Team name
  - `color` (text) - Display color
  - `description` (text) - Team description
  - `created_at` (timestamptz)

  ### 5. measure_units
  Units of measurement for items
  - `id` (uuid, primary key)
  - `name` (text) - Unit name (e.g., Kilogram)
  - `symbol` (text) - Short symbol (e.g., kg)
  - `type` (text) - Type: weight, volume, length, count, time
  - `base_unit` (text) - Base unit for conversion
  - `conversion_factor` (decimal) - Factor to convert to base unit
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Create policies for authenticated users to read all reference data
  - Restrict write operations to admin users only (for now, allow all authenticated)

  ## Important Notes
  - These tables store relatively static reference data
  - Data will be seeded with initial values in a separate migration
  - Foreign key constraints added to ensure data integrity
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL DEFAULT '#gray',
  icon text NOT NULL DEFAULT '📋',
  parent_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  level text NOT NULL CHECK (level IN ('parent', 'main', 'category', 'subcategory')),
  order_number integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated
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

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact text,
  email text,
  color text NOT NULL DEFAULT '#gray',
  active boolean DEFAULT true,
  categories text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view suppliers"
  ON suppliers FOR SELECT
  TO authenticated
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

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL DEFAULT '#gray',
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view teams"
  ON teams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create teams"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update teams"
  ON teams FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete teams"
  ON teams FOR DELETE
  TO authenticated
  USING (true);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id bigint UNIQUE,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'manager', 'driver', 'supplier', 'owner')),
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  color text NOT NULL DEFAULT '#gray',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (true);

-- Create measure_units table
CREATE TABLE IF NOT EXISTS measure_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  symbol text NOT NULL,
  type text NOT NULL CHECK (type IN ('weight', 'volume', 'length', 'count', 'time')),
  base_unit text,
  conversion_factor decimal(10, 6),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE measure_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view measure units"
  ON measure_units FOR SELECT
  TO authenticated
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_level ON categories(level);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(active);
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_user_id ON profiles(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_team_id ON profiles(team_id);
CREATE INDEX IF NOT EXISTS idx_measure_units_type ON measure_units(type);
