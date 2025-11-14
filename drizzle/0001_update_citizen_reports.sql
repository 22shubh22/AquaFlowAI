
-- Drop the old table if it exists (this will cause data loss)
DROP TABLE IF EXISTS "citizen_reports";

-- Create citizen_reports table with userId instead of contact
CREATE TABLE IF NOT EXISTS "citizen_reports" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "type" text NOT NULL,
  "location" text NOT NULL,
  "geo_lat" numeric,
  "geo_lng" numeric,
  "description" text NOT NULL,
  "user_id" varchar NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "timestamp" timestamp DEFAULT now(),
  "images" jsonb,
  "report_hash" text NOT NULL,
  "previous_hash" text NOT NULL,
  "block_number" integer NOT NULL,
  "signature" text NOT NULL,
  "status_history" jsonb NOT NULL
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS "idx_reports_user_id" ON "citizen_reports"("user_id");
CREATE INDEX IF NOT EXISTS "idx_reports_block_number" ON "citizen_reports"("block_number");
CREATE INDEX IF NOT EXISTS "idx_reports_timestamp" ON "citizen_reports"("timestamp");
