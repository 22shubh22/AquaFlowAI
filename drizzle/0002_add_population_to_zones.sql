
-- Add population column to zones table
ALTER TABLE "zones" ADD COLUMN "population" integer NOT NULL DEFAULT 50000;

-- Add index for population history
CREATE INDEX IF NOT EXISTS "idx_population_history_zone_id" ON "population_history"("zone_id");
CREATE INDEX IF NOT EXISTS "idx_population_history_timestamp" ON "population_history"("timestamp");

-- Create population_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS "population_history" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "zone_id" varchar NOT NULL,
  "population" integer NOT NULL,
  "timestamp" timestamp DEFAULT now()
);
