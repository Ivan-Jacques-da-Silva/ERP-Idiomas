
-- Adicionar coluna duration (duração em horas)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS duration INTEGER;

-- Adicionar colunas de guia de ensino
ALTER TABLE courses ADD COLUMN IF NOT EXISTS teaching_guide_type VARCHAR;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS suggested_weekly_hours VARCHAR;

-- Remover colunas antigas se existirem
ALTER TABLE courses DROP COLUMN IF EXISTS teaching_guide_audio_url;
ALTER TABLE courses DROP COLUMN IF EXISTS teaching_guide_video_url;
ALTER TABLE courses DROP COLUMN IF EXISTS book_id;
