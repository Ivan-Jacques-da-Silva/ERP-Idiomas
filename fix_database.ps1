# Script PowerShell para corrigir o banco de dados Docker
# Execute este script quando o Docker estiver rodando

Write-Host "Verificando se o Docker está rodando..." -ForegroundColor Yellow

# Verificar se o Docker está rodando
$dockerStatus = docker ps 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Docker não está rodando. Inicie o Docker Desktop primeiro." -ForegroundColor Red
    Write-Host "Depois execute: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host "Docker está rodando. Executando correção do banco..." -ForegroundColor Green

# Executar o script SQL no container do banco
Write-Host "Executando migração para adicionar coluna weekly_hours..." -ForegroundColor Yellow

docker exec -i erp-idiomas-db psql -U postgres -d school_system -c "
-- Adicionar a coluna weekly_hours se não existir
ALTER TABLE books ADD COLUMN IF NOT EXISTS weekly_hours varchar;

-- Adicionar a coluna suggested_weekly_hours na tabela courses se não existir  
ALTER TABLE courses ADD COLUMN IF NOT EXISTS suggested_weekly_hours varchar;

-- Verificar se as colunas foram criadas
SELECT 'books.weekly_hours criada com sucesso' as status 
FROM information_schema.columns 
WHERE table_name = 'books' AND column_name = 'weekly_hours';

SELECT 'courses.suggested_weekly_hours criada com sucesso' as status
FROM information_schema.columns 
WHERE table_name = 'courses' AND column_name = 'suggested_weekly_hours';
"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migração executada com sucesso!" -ForegroundColor Green
    Write-Host "Agora teste o endpoint /api/books novamente." -ForegroundColor Yellow
} else {
    Write-Host "❌ Erro ao executar a migração." -ForegroundColor Red
}

Write-Host "Pressione qualquer tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")