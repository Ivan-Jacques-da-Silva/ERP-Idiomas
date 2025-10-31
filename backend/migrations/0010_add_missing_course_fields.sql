
-- Adicionar campos faltantes na tabela courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS workload_hours INTEGER;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS teaching_guide_type VARCHAR;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS teaching_guide_url VARCHAR;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS audio_url VARCHAR;

-- Remover total_duration e workload_weeks se existirem (não estão sendo usados)
ALTER TABLE courses DROP COLUMN IF EXISTS total_duration;
ALTER TABLE courses DROP COLUMN IF EXISTS workload_weeks;
