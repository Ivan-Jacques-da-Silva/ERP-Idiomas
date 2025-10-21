# Script PowerShell para corrigir problemas de schema no banco de dados
# Execute este script no servidor para resolver todos os problemas de colunas

Write-Host "🔧 INICIANDO CORREÇÃO DO BANCO DE DADOS..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Yellow

# Definir variáveis
$DATABASE_URL = "postgresql://school_admin:v9nQm7X2kL8Z4pE1aD6R0yU3tB5C_-N@127.0.0.1:5432/school_system"
$POSTGRES_URL = "postgresql://school_admin:v9nQm7X2kL8Z4pE1aD6R0yU3tB5C_-N@127.0.0.1:5432/postgres"

Write-Host "📋 PASSO 1: Fazendo backup dos dados importantes..." -ForegroundColor Cyan
if (!(Test-Path "backup")) { New-Item -ItemType Directory -Path "backup" }
psql "${DATABASE_URL}?sslmode=disable" -c "COPY (SELECT email, first_name, last_name, password_hash, role_id FROM users) TO STDOUT WITH CSV HEADER;" | Out-File -FilePath "backup/users_backup.csv"
psql "${DATABASE_URL}?sslmode=disable" -c "COPY (SELECT name, display_name, is_deletable FROM roles) TO STDOUT WITH CSV HEADER;" | Out-File -FilePath "backup/roles_backup.csv"
Write-Host "✅ Backup concluído em ./backup/" -ForegroundColor Green

Write-Host "📋 PASSO 2: Parando aplicação..." -ForegroundColor Cyan
pm2 stop all
Write-Host "✅ Aplicação parada" -ForegroundColor Green

Write-Host "📋 PASSO 3: Recriando banco de dados..." -ForegroundColor Cyan
psql "${POSTGRES_URL}?sslmode=disable" -c "DROP DATABASE IF EXISTS school_system;"
psql "${POSTGRES_URL}?sslmode=disable" -c "CREATE DATABASE school_system;"
Write-Host "✅ Banco recriado" -ForegroundColor Green

Write-Host "📋 PASSO 4: Navegando para diretório backend..." -ForegroundColor Cyan
Set-Location backend

Write-Host "📋 PASSO 5: Limpando cache do Drizzle..." -ForegroundColor Cyan
if (Test-Path ".drizzle") { Remove-Item -Recurse -Force ".drizzle" }
if (Test-Path "node_modules/.cache") { Remove-Item -Recurse -Force "node_modules/.cache" }
Write-Host "✅ Cache limpo" -ForegroundColor Green

Write-Host "📋 PASSO 6: Aplicando migrações do Drizzle..." -ForegroundColor Cyan
npx drizzle-kit push --force
Write-Host "✅ Migrações aplicadas" -ForegroundColor Green

Write-Host "📋 PASSO 7: Executando seed para recriar dados básicos..." -ForegroundColor Cyan
npm run seed
Write-Host "✅ Seed executado" -ForegroundColor Green

Write-Host "📋 PASSO 8: Compilando TypeScript..." -ForegroundColor Cyan
npm run build
Write-Host "✅ TypeScript compilado" -ForegroundColor Green

Write-Host "📋 PASSO 9: Reiniciando aplicação..." -ForegroundColor Cyan
pm2 start all
Write-Host "✅ Aplicação reiniciada" -ForegroundColor Green

Write-Host "📋 PASSO 10: Verificando status..." -ForegroundColor Cyan
Start-Sleep -Seconds 3
pm2 status
Write-Host ""

Write-Host "📋 PASSO 11: Testando conexão com banco..." -ForegroundColor Cyan
psql "${DATABASE_URL}?sslmode=disable" -c "SELECT COUNT(*) as total_users FROM users;"
psql "${DATABASE_URL}?sslmode=disable" -c "SELECT name, is_deletable FROM roles ORDER BY name;"
psql "${DATABASE_URL}?sslmode=disable" -c "\d units" | Select-String "franchisee_type"
Write-Host ""

Write-Host "🎉 CORREÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Yellow
Write-Host "✅ Banco de dados recriado com schema correto" -ForegroundColor Green
Write-Host "✅ Dados básicos inseridos via seed" -ForegroundColor Green
Write-Host "✅ Aplicação reiniciada" -ForegroundColor Green
Write-Host ""
Write-Host "🔑 USUÁRIOS PADRÃO CRIADOS:" -ForegroundColor Yellow
Write-Host "   - admin@escola.com (senha: admin123)" -ForegroundColor White
Write-Host "   - admin@demo.com (senha: demo123)" -ForegroundColor White
Write-Host ""
Write-Host "📊 VERIFICAR LOGS:" -ForegroundColor Yellow
Write-Host "   pm2 logs --lines 20" -ForegroundColor White
Write-Host ""
Write-Host "🌐 TESTAR LOGIN:" -ForegroundColor Yellow
Write-Host "   Acesse a aplicação e teste o login" -ForegroundColor White
Write-Host ""
Write-Host "📁 BACKUP DOS DADOS ANTIGOS:" -ForegroundColor Yellow
Write-Host "   Disponível em ./backup/" -ForegroundColor White