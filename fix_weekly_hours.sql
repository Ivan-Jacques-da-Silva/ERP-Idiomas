-- Script para corrigir o erro da coluna weekly_hours
-- Execute este script no banco de dados PostgreSQL

-- Conectar ao banco: psql -U postgres -d school_system

-- Verificar se a coluna existe
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'books' AND column_name = 'weekly_hours';

-- Adicionar a coluna weekly_hours se não existir
ALTER TABLE "books" 
ADD COLUMN IF NOT EXISTS "weekly_hours" varchar;

-- Adicionar a coluna suggested_weekly_hours na tabela courses se não existir
ALTER TABLE "courses" 
ADD COLUMN IF NOT EXISTS "suggested_weekly_hours" varchar;

-- Verificar se as colunas foram criadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'books' AND column_name IN ('weekly_hours');

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'courses' AND column_name IN ('suggested_weekly_hours');

-- Opcional: Adicionar alguns dados de exemplo
-- UPDATE books SET weekly_hours = '2 horas semanais' WHERE weekly_hours IS NULL;