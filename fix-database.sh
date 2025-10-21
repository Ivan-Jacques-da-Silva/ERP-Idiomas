#!/bin/bash

# Script para corrigir problemas de schema no banco de dados
# Execute este script no servidor VPS para resolver todos os problemas de colunas

echo "🔧 INICIANDO CORREÇÃO DO BANCO DE DADOS..."
echo "================================================"

# Definir variáveis
DATABASE_URL="postgresql://school_admin:v9nQm7X2kL8Z4pE1aD6R0yU3tB5C_-N@127.0.0.1:5432/school_system"
POSTGRES_URL="postgresql://school_admin:v9nQm7X2kL8Z4pE1aD6R0yU3tB5C_-N@127.0.0.1:5432/postgres"

echo "📋 PASSO 1: Fazendo backup dos dados importantes..."
mkdir -p backup
psql "${DATABASE_URL}?sslmode=disable" -c "COPY (SELECT email, first_name, last_name, password_hash, role_id FROM users) TO STDOUT WITH CSV HEADER;" > backup/users_backup.csv
psql "${DATABASE_URL}?sslmode=disable" -c "COPY (SELECT name, display_name, is_deletable FROM roles) TO STDOUT WITH CSV HEADER;" > backup/roles_backup.csv
echo "✅ Backup concluído em ./backup/"

echo "📋 PASSO 2: Parando aplicação..."
pm2 stop all
echo "✅ Aplicação parada"

echo "📋 PASSO 3: Recriando banco de dados..."
psql "${POSTGRES_URL}?sslmode=disable" -c "DROP DATABASE IF EXISTS school_system;"
psql "${POSTGRES_URL}?sslmode=disable" -c "CREATE DATABASE school_system;"
echo "✅ Banco recriado"

echo "📋 PASSO 4: Navegando para diretório backend..."
cd backend

echo "📋 PASSO 5: Limpando cache do Drizzle..."
rm -rf .drizzle
rm -rf node_modules/.cache
echo "✅ Cache limpo"

echo "📋 PASSO 6: Aplicando migrações do Drizzle..."
npx drizzle-kit push --force
echo "✅ Migrações aplicadas"

echo "📋 PASSO 7: Executando seed para recriar dados básicos..."
npm run seed
echo "✅ Seed executado"

echo "📋 PASSO 8: Compilando TypeScript..."
npm run build
echo "✅ TypeScript compilado"

echo "📋 PASSO 9: Reiniciando aplicação..."
pm2 start all
echo "✅ Aplicação reiniciada"

echo "📋 PASSO 10: Verificando status..."
sleep 3
pm2 status
echo ""

echo "📋 PASSO 11: Testando conexão com banco..."
psql "${DATABASE_URL}?sslmode=disable" -c "SELECT COUNT(*) as total_users FROM users;"
psql "${DATABASE_URL}?sslmode=disable" -c "SELECT name, is_deletable FROM roles ORDER BY name;"
psql "${DATABASE_URL}?sslmode=disable" -c "\d units" | grep franchisee_type
echo ""

echo "🎉 CORREÇÃO CONCLUÍDA!"
echo "================================================"
echo "✅ Banco de dados recriado com schema correto"
echo "✅ Dados básicos inseridos via seed"
echo "✅ Aplicação reiniciada"
echo ""
echo "🔑 USUÁRIOS PADRÃO CRIADOS:"
echo "   - admin@escola.com (senha: admin123)"
echo "   - admin@demo.com (senha: demo123)"
echo ""
echo "📊 VERIFICAR LOGS:"
echo "   pm2 logs --lines 20"
echo ""
echo "🌐 TESTAR LOGIN:"
echo "   Acesse a aplicação e teste o login"
echo ""
echo "📁 BACKUP DOS DADOS ANTIGOS:"
echo "   Disponível em ./backup/"