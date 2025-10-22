# Deploy Automático - ERP Idiomas

Sistema de deploy automático que permite atualizar o servidor diretamente do seu localhost com um simples comando.

## 🚀 Comandos Disponíveis

### 1. Deploy Rápido (Recomendado) ⚡
```bash
npm run deploy:quick
```
- **Mais rápido** - Apenas reinicia o backend
- **Ideal para**: Mudanças no código do backend
- **Tempo**: ~30 segundos
- **Sem rebuild**: Usa container existente

### 2. Deploy Backend Completo 🔧
```bash
npm run deploy:backend
```
- **Rebuild do backend** - Reconstrói o container
- **Ideal para**: Mudanças em dependências do backend
- **Tempo**: ~2-3 minutos
- **Inclui**: Backup automático do banco

### 3. Deploy Completo 🏗️
```bash
npm run deploy
```
- **Frontend + Backend** - Reconstrói tudo
- **Ideal para**: Mudanças no frontend ou deploy inicial
- **Tempo**: ~5-8 minutos
- **Inclui**: Backup + rebuild completo

## ⚙️ Configuração Inicial

### 1. Configure o Servidor

Edite o arquivo `deploy.config.js`:

```javascript
module.exports = {
  server: {
    host: 'seu-servidor.com',     // IP ou domínio
    username: 'root',             // usuário SSH
    port: 22,                     // porta SSH
    privateKey: '~/.ssh/id_rsa',  // chave SSH
  },
  paths: {
    app: '/opt/erp-idiomas',      // pasta da app no servidor
    backup: '/opt/backups/erp-idiomas'
  }
};
```

### 2. Configure SSH (Recomendado)

Para não precisar digitar senha toda vez:

```bash
# Gerar chave SSH (se não tiver)
ssh-keygen -t rsa -b 4096

# Copiar chave para o servidor
ssh-copy-id root@seu-servidor.com

# Testar conexão
ssh root@seu-servidor.com
```

### 3. Instalar Dependências

No seu localhost:
```bash
npm install rsync  # Para Windows, instalar via WSL ou Git Bash
```

## 📋 Pré-requisitos

### No Servidor:
- ✅ Docker e Docker Compose instalados
- ✅ Aplicação já deployada com Docker
- ✅ SSH habilitado
- ✅ Usuário com permissões Docker

### No Localhost:
- ✅ Node.js instalado
- ✅ SSH configurado
- ✅ rsync disponível (Git Bash no Windows)

## 🔄 Fluxo de Deploy

### Deploy Rápido (`deploy:quick`)
1. 📦 Envia código do backend via rsync
2. 🔄 Reinicia container do backend
3. 📋 Mostra logs e status

### Deploy Backend (`deploy:backend`)
1. 🔄 Backup automático do banco
2. 📦 Envia código do backend
3. 🛑 Para container do backend
4. 🔨 Reconstrói container
5. ▶️ Inicia container
6. 📋 Verifica status e logs

### Deploy Completo (`deploy`)
1. 🔄 Backup automático do banco
2. 📦 Envia todo o código
3. 🛑 Para todos os containers
4. 🔨 Reconstrói tudo (sem cache)
5. ▶️ Inicia todos os containers
6. 🧪 Testa conectividade
7. 📋 Verifica status e logs

## 🛠️ Comandos Manuais

Se precisar executar comandos específicos:

```bash
# Executar script diretamente
node scripts/deploy-quick.js
node scripts/deploy-backend.js
node scripts/deploy-full.js

# Ver logs no servidor
ssh root@seu-servidor.com "cd /opt/erp-idiomas && docker-compose logs -f"

# Status dos containers
ssh root@seu-servidor.com "cd /opt/erp-idiomas && docker-compose ps"

# Backup manual
ssh root@seu-servidor.com "cd /opt/erp-idiomas && docker-compose exec -T database pg_dump -U postgres erp_idiomas > backup_manual.sql"
```

## 🚨 Troubleshooting

### Erro de SSH
```bash
# Verificar conexão SSH
ssh -v root@seu-servidor.com

# Verificar chave SSH
ssh-add -l
```

### Erro de rsync
```bash
# No Windows, usar Git Bash ou WSL
# Verificar se rsync está disponível
which rsync
```

### Container não inicia
```bash
# Ver logs detalhados
ssh root@seu-servidor.com "cd /opt/erp-idiomas && docker-compose logs backend"

# Verificar espaço em disco
ssh root@seu-servidor.com "df -h"
```

### Erro de permissão
```bash
# Verificar permissões Docker
ssh root@seu-servidor.com "docker ps"

# Adicionar usuário ao grupo docker (se necessário)
ssh root@seu-servidor.com "usermod -aG docker $USER"
```

## 📊 Monitoramento

### Verificar Status
```bash
# Status rápido
ssh root@seu-servidor.com "cd /opt/erp-idiomas && docker-compose ps"

# Logs em tempo real
ssh root@seu-servidor.com "cd /opt/erp-idiomas && docker-compose logs -f --tail=50"

# Uso de recursos
ssh root@seu-servidor.com "docker stats --no-stream"
```

### Backup e Restore
```bash
# Listar backups
ssh root@seu-servidor.com "ls -la /opt/backups/erp-idiomas/"

# Restaurar backup específico
ssh root@seu-servidor.com "cd /opt/erp-idiomas && docker-compose exec -T database psql -U postgres erp_idiomas < /opt/backups/erp-idiomas/backup_20240101_120000.sql"
```

## 🎯 Dicas de Uso

### Para Desenvolvimento Diário:
```bash
# Mudanças pequenas no backend
npm run deploy:quick

# Mudanças maiores no backend
npm run deploy:backend
```

### Para Releases:
```bash
# Deploy completo com frontend
npm run deploy
```

### Para Emergências:
```bash
# Rollback rápido (se tiver backup)
ssh root@seu-servidor.com "cd /opt/erp-idiomas && docker-compose down && docker-compose up -d"
```

## 🔒 Segurança

- ✅ Use chaves SSH em vez de senhas
- ✅ Configure firewall no servidor
- ✅ Backups automáticos antes de cada deploy
- ✅ Monitore logs regularmente
- ✅ Mantenha backups por pelo menos 7 dias

## 📝 Exemplo de Uso

```bash
# 1. Fazer mudanças no código
vim backend/server/routes.ts

# 2. Testar localmente
npm run dev

# 3. Deploy rápido para o servidor
npm run deploy:quick

# 4. Verificar se funcionou
# (o script já mostra os logs automaticamente)
```

## 🎉 Pronto!

Agora você pode atualizar seu servidor com um simples comando! 

**Recomendação**: Comece sempre com `npm run deploy:quick` para mudanças simples no backend. É mais rápido e seguro.