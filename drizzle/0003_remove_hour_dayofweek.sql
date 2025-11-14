
-- Remove hour and day_of_week columns from zone_history table
ALTER TABLE zone_history DROP COLUMN IF EXISTS hour;
ALTER TABLE zone_history DROP COLUMN IF EXISTS day_of_week;
