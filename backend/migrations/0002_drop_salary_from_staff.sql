-- Drop obsolete salary column from staff
ALTER TABLE "staff"
  DROP COLUMN IF EXISTS "salary";

