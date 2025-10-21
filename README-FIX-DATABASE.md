# 🔧 Script de Correção do Banco de Dados

Este script resolve todos os problemas de schema no banco de dados, incluindo colunas faltantes como `is_deletable` e `franchisee_type`.

## 📋 O que o script faz:

1. **Backup dos dados importantes** (users, roles)
2. **Para a aplicação** (pm2 stop all)
3. **Recria o banco de dados** completamente
4. **Aplica todas as migrações** do Drizzle
5. **Executa o seed** para recriar dados básicos
6. **Compila o TypeScript**
7. **Reinicia a aplicação**
8. **Verifica se tudo está funcionando**

## 🚀 Como executar:

### No Linux/Mac (VPS):
```bash
chmod +x fix-database.sh
./fix-database.sh
```

### No Windows:
```powershell
.\fix-database.ps1
```

## ⚠️ IMPORTANTE:

- **Este script apaga todos os dados do banco atual**
- **Faz backup dos usuários e roles antes**
- **Recria usuários padrão via seed**

## 🔑 Usuários que serão criados:

- `admin@escola.com` (senha: `admin123`)
- `admin@demo.com` (senha: `demo123`)
- Outros usuários conforme definido no seed

## 📊 Após executar:

1. **Verificar logs**: `pm2 logs --lines 20`
2. **Testar login** na aplicação
3. **Verificar se as colunas existem**:
   ```sql
   \d roles    -- deve mostrar is_deletable
   \d units    -- deve mostrar franchisee_type
   ```

## 🔄 Se algo der errado:

1. Verificar se PostgreSQL está rodando
2. Verificar se as credenciais estão corretas
3. Verificar logs do PM2: `pm2 logs`
4. Reexecutar o script se necessário

## 📁 Backup:

Os dados antigos ficam salvos em `./backup/`:
- `users_backup.csv`
- `roles_backup.csv`

## 🎯 Resultado esperado:

- ✅ Banco com schema correto
- ✅ Todas as colunas presentes
- ✅ Login funcionando
- ✅ Sem erros de "column does not exist"