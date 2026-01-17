-- Event Management System Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customer Master Table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event Type Master Table
CREATE TABLE IF NOT EXISTS event_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event Bookings Table
CREATE TABLE IF NOT EXISTS event_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  event_type_id UUID NOT NULL REFERENCES event_types(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  payment_status BOOLEAN DEFAULT FALSE,
  images TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_event_bookings_customer_id ON event_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_event_bookings_event_type_id ON event_bookings(event_type_id);
CREATE INDEX IF NOT EXISTS idx_event_bookings_start_date ON event_bookings(start_date);
CREATE INDEX IF NOT EXISTS idx_event_bookings_end_date ON event_bookings(end_date);
CREATE INDEX IF NOT EXISTS idx_event_bookings_payment_status ON event_bookings(payment_status);

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_bookings ENABLE ROW LEVEL SECURITY;

-- Create policies to allow authenticated users full access
-- Note: Adjust these policies based on your security requirements

-- Customers policies
CREATE POLICY "Allow authenticated users to read customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete customers"
  ON customers FOR DELETE
  TO authenticated
  USING (true);

-- Event Types policies
CREATE POLICY "Allow authenticated users to read event_types"
  ON event_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert event_types"
  ON event_types FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update event_types"
  ON event_types FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete event_types"
  ON event_types FOR DELETE
  TO authenticated
  USING (true);

-- Event Bookings policies
CREATE POLICY "Allow authenticated users to read event_bookings"
  ON event_bookings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert event_bookings"
  ON event_bookings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update event_bookings"
  ON event_bookings FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete event_bookings"
  ON event_bookings FOR DELETE
  TO authenticated
  USING (true);
