# 🚀 Guia de Deploy - Configuração Adaptativa

## 📋 Arquivos de Configuração

### 🔧 `.env` (Desenvolvimento)
- Usado para desenvolvimento local
- `NODE_ENV=development`

### 🌐 `.env.production` (Servidor)
- Usado para produção no servidor
- `NODE_ENV=production`
- **FRONTEND_URL sem backticks**

## 🛠️ Como usar no servidor:

### Opção 1: Substituir arquivo
```bash
# No servidor VPS:
cd /var/www/erp/back
cp .env.production .env
```

### Opção 2: Editar manualmente
```bash
# No servidor VPS:
cd /var/www/erp/back
nano .env

# Alterar:
NODE_ENV=development  →  NODE_ENV=production
# Remover backticks do FRONTEND_URL se existirem
```

## 🔄 Após alterar configuração:

```bash
# 1. Executar migração
npx drizzle-kit push

# 2. Reiniciar aplicação
pm2 restart all
# OU
pm2 restart erp
```

## ⚠️ Problemas Comuns:

1. **Backticks no FRONTEND_URL** - Remover `` ` ``
2. **NODE_ENV incorreto** - Usar `production` no servidor
3. **Migração não aplicada** - Executar `npx drizzle-kit push`

## ✅ Verificação:

```bash
# Testar conexão com banco
psql "postgresql://school_admin:v9nQm7X2kL8Z4pE1aD6R0yU3tB5C_-N@127.0.0.1:5432/school_system" -c "\d roles"

# Verificar se coluna is_deletable existe
psql "postgresql://school_admin:v9nQm7X2kL8Z4pE1aD6R0yU3tB5C_-N@127.0.0.1:5432/school_system" -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'roles';"
```