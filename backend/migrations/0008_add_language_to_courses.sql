
-- Migration: Add language column back to courses table
-- Added to satisfy schema requirements

ALTER TABLE "courses" ADD COLUMN "language" varchar NOT NULL DEFAULT 'Inglês';
