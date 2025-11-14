
-- Users table (admin users)
CREATE TABLE IF NOT EXISTS "users" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "username" text NOT NULL UNIQUE,
  "password" text NOT NULL
);

-- Citizen users table
CREATE TABLE IF NOT EXISTS "citizen_users" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "username" text NOT NULL UNIQUE,
  "password" text NOT NULL,
  "email" text NOT NULL,
  "phone" text NOT NULL,
  "created_at" timestamp DEFAULT now()
);

-- Zones table
CREATE TABLE IF NOT EXISTS "zones" (
  "id" varchar PRIMARY KEY,
  "name" text NOT NULL,
  "status" text NOT NULL,
  "flow_rate" numeric NOT NULL,
  "pressure" numeric NOT NULL,
  "last_updated" timestamp DEFAULT now(),
  "lat" numeric NOT NULL,
  "lng" numeric NOT NULL
);

-- Water sources table
CREATE TABLE IF NOT EXISTS "water_sources" (
  "id" varchar PRIMARY KEY,
  "name" text NOT NULL,
  "type" text NOT NULL,
  "location" text NOT NULL,
  "geo_lat" numeric NOT NULL,
  "geo_lng" numeric NOT NULL,
  "capacity" numeric NOT NULL,
  "current_level" numeric NOT NULL,
  "quality" text NOT NULL,
  "last_tested" timestamp,
  "status" text NOT NULL
);

-- Pumps table
CREATE TABLE IF NOT EXISTS "pumps" (
  "id" varchar PRIMARY KEY,
  "zone_id" varchar NOT NULL,
  "source_id" varchar NOT NULL,
  "status" text NOT NULL,
  "schedule" text NOT NULL,
  "flow_rate" numeric NOT NULL,
  "last_maintenance" timestamp
);

-- Alerts table
CREATE TABLE IF NOT EXISTS "alerts" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "type" text NOT NULL,
  "zone_id" varchar NOT NULL,
  "severity" text NOT NULL,
  "message" text NOT NULL,
  "timestamp" timestamp DEFAULT now(),
  "resolved" boolean DEFAULT false
);

-- Citizen reports table (BLOCKCHAIN)
CREATE TABLE IF NOT EXISTS "citizen_reports" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "type" text NOT NULL,
  "location" text NOT NULL,
  "geo_lat" numeric,
  "geo_lng" numeric,
  "description" text NOT NULL,
  "contact" text NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "timestamp" timestamp DEFAULT now(),
  "images" jsonb,
  "report_hash" text NOT NULL,
  "previous_hash" text NOT NULL,
  "block_number" integer NOT NULL,
  "signature" text NOT NULL,
  "status_history" jsonb NOT NULL
);

-- Zone historical data
CREATE TABLE IF NOT EXISTS "zone_history" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "zone_id" varchar NOT NULL,
  "flow_rate" numeric NOT NULL,
  "pressure" numeric NOT NULL,
  "timestamp" timestamp DEFAULT now(),
  "hour" integer NOT NULL,
  "day_of_week" integer NOT NULL
);

-- Reservoir history
CREATE TABLE IF NOT EXISTS "reservoir_history" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "source_id" varchar NOT NULL,
  "level" numeric NOT NULL,
  "timestamp" timestamp DEFAULT now()
);

-- Pump history
CREATE TABLE IF NOT EXISTS "pump_history" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "pump_id" varchar NOT NULL,
  "status" text NOT NULL,
  "flow_rate" numeric NOT NULL,
  "timestamp" timestamp DEFAULT now(),
  "duration" integer NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_zone_history_zone_id" ON "zone_history"("zone_id");
CREATE INDEX IF NOT EXISTS "idx_zone_history_timestamp" ON "zone_history"("timestamp");
CREATE INDEX IF NOT EXISTS "idx_reports_block_number" ON "citizen_reports"("block_number");
CREATE INDEX IF NOT EXISTS "idx_reports_timestamp" ON "citizen_reports"("timestamp");
CREATE INDEX IF NOT EXISTS "idx_reservoir_history_source_id" ON "reservoir_history"("source_id");
CREATE INDEX IF NOT EXISTS "idx_pump_history_pump_id" ON "pump_history"("pump_id");
