# Deploy com Docker - ERP Idiomas

Este documento descreve como fazer o deploy da aplicação ERP Idiomas usando Docker, com frontend buildado e backend rodando com PM2.

## 📋 Pré-requisitos

- Docker e Docker Compose instalados no servidor
- Nginx instalado no servidor (configuração externa ao Docker)
- Acesso SSH ao servidor
- Domínio configurado apontando para o servidor

## 🚀 Deploy da Aplicação

### 1. Preparação do Ambiente

```bash
# Clone o repositório no servidor
git clone <seu-repositorio> /opt/erp-idiomas
cd /opt/erp-idiomas

# Copie e configure as variáveis de ambiente
cp .env.example .env
nano .env
```

### 2. Configuração das Variáveis de Ambiente

Edite o arquivo `.env` com suas configurações:

```env
# Database Configuration
DB_NAME=erp_idiomas
DB_USER=postgres
DB_PASSWORD=sua_senha_segura_aqui

# Backend Configuration
NODE_ENV=production
PORT=3000
JWT_SECRET=sua_chave_jwt_muito_segura_aqui
SESSION_SECRET=sua_chave_session_muito_segura_aqui

# Database URL for Drizzle ORM
DATABASE_URL=postgresql://postgres:sua_senha_segura_aqui@database:5432/erp_idiomas

# Other configurations
CORS_ORIGIN=https://seu-dominio.com
```

### 3. Build e Execução dos Containers

```bash
# Build e start dos serviços
docker-compose up -d --build

# Verificar se os containers estão rodando
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f
```

### 4. Configuração do Banco de Dados

```bash
# Executar migrações (se necessário)
docker-compose exec backend npm run db:push

# Executar seed (se necessário)
docker-compose exec backend npm run seed
```

## 🌐 Configuração do Nginx no Servidor

### Configuração do Virtual Host

Crie o arquivo `/etc/nginx/sites-available/erp-idiomas`:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;
    
    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Frontend (React App)
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Fallback para SPA
        try_files $uri $uri/ @fallback;
    }
    
    # Fallback para Single Page Application
    location @fallback {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # WebSocket support (se necessário)
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:8080;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

### Ativação da Configuração

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/erp-idiomas /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

## 🔧 Comandos Úteis

### Gerenciamento dos Containers

```bash
# Parar todos os serviços
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados do banco)
docker-compose down -v

# Rebuild apenas um serviço
docker-compose up -d --build backend

# Ver logs de um serviço específico
docker-compose logs -f backend

# Executar comando dentro do container
docker-compose exec backend bash
```

### Backup do Banco de Dados

```bash
# Criar backup
docker-compose exec database pg_dump -U postgres erp_idiomas > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker-compose exec -T database psql -U postgres erp_idiomas < backup_file.sql
```

### Monitoramento

```bash
# Ver status dos containers
docker-compose ps

# Ver uso de recursos
docker stats

# Ver logs do PM2 dentro do container
docker-compose exec backend pm2 logs

# Ver status do PM2
docker-compose exec backend pm2 status
```

## 🔒 Segurança

### Firewall

```bash
# Permitir apenas portas necessárias
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### SSL/TLS

Recomenda-se usar Let's Encrypt para certificados SSL gratuitos:

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoramento e Logs

### Logs da Aplicação

```bash
# Logs do Docker Compose
docker-compose logs -f --tail=100

# Logs específicos do backend
docker-compose logs -f backend

# Logs do PM2
docker-compose exec backend pm2 logs --lines 100
```

### Monitoramento de Recursos

```bash
# Uso de CPU e memória dos containers
docker stats

# Espaço em disco
df -h
docker system df
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Container não inicia**: Verificar logs com `docker-compose logs`
2. **Erro de conexão com banco**: Verificar variáveis de ambiente
3. **Frontend não carrega**: Verificar se o build foi feito corretamente
4. **API não responde**: Verificar se o backend está rodando na porta correta

### Comandos de Diagnóstico

```bash
# Verificar conectividade entre containers
docker-compose exec frontend ping backend

# Verificar portas abertas
netstat -tlnp | grep :3000
netstat -tlnp | grep :8080

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## 📝 Notas Importantes

- O Nginx é configurado **externamente** ao Docker para maior flexibilidade
- O backend roda com PM2 para melhor gerenciamento de processos
- O frontend é servido como arquivos estáticos buildados
- Sempre faça backup do banco antes de atualizações
- Monitore os logs regularmente para identificar problemas

## 🔄 Atualizações

Para atualizar a aplicação:

```bash
# 1. Fazer backup do banco
docker-compose exec database pg_dump -U postgres erp_idiomas > backup_pre_update.sql

# 2. Parar os serviços
docker-compose down

# 3. Atualizar código
git pull origin main

# 4. Rebuild e restart
docker-compose up -d --build

# 5. Executar migrações se necessário
docker-compose exec backend npm run db:push
```