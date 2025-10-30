
-- Migration: Fix courses table structure
-- Remove old columns if they exist and ensure correct schema

-- Verificar e remover coluna 'duration' antiga se existir
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'duration'
    ) THEN
        ALTER TABLE courses DROP COLUMN duration;
    END IF;
END $$;

-- Verificar e remover coluna 'suggested_weekly_hours' se existir
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'suggested_weekly_hours'
    ) THEN
        ALTER TABLE courses DROP COLUMN suggested_weekly_hours;
    END IF;
END $$;

-- Garantir que todas as colunas necessárias existem
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'total_duration'
    ) THEN
        ALTER TABLE courses ADD COLUMN total_duration integer;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'workload_hours'
    ) THEN
        ALTER TABLE courses ADD COLUMN workload_hours integer;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'workload_weeks'
    ) THEN
        ALTER TABLE courses ADD COLUMN workload_weeks integer;
    END IF;
END $$;
