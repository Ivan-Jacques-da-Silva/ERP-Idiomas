-- Add missing columns to align DB with Drizzle schema
-- Books: weekly_hours
ALTER TABLE "books"
  ADD COLUMN IF NOT EXISTS "weekly_hours" varchar;

-- Courses: suggested_weekly_hours
ALTER TABLE "courses"
  ADD COLUMN IF NOT EXISTS "suggested_weekly_hours" varchar;

