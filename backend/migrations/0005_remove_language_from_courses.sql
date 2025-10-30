
-- Migration: Remove language column from courses table
-- Todos os cursos são de inglês, não precisamos do campo

ALTER TABLE courses DROP COLUMN IF EXISTS language;
