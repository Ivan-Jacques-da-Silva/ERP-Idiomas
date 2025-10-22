# Migração para Docker - ERP Idiomas

## 🐳 Dockerização do Sistema Existente

### 1. Instalar Docker (se não tiver)

```bash
# Conectar no VPS
ssh root@erp.vision.dev.br

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### 2. Preparar Estrutura Docker

```bash
# Ir para pasta da aplicação (onde estão as pastas front e back)
cd /caminho/para/sua/aplicacao

# Copiar arquivos Docker do projeto
# (Dockerfile do frontend, Dockerfile do backend, docker-compose.yml, etc.)
```

### 3. Ajustar docker-compose.yml

Edite o `docker-compose.yml` para usar sua configuração atual:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./front  # Sua pasta atual do frontend
      dockerfile: ../Dockerfile  # Copie o Dockerfile para a raiz
    container_name: erp-frontend
    restart: unless-stopped
    ports:
       - "5051:80"
    networks:
      - erp-network

  backend:
    build:
      context: ./back   # Sua pasta atual do backend
      dockerfile: ../Dockerfile  # Copie o Dockerfile para a raiz
    container_name: erp-backend
    restart: unless-stopped
    ports:
       - "5052:3000"
    environment:
      - NODE_ENV=production
      # Use suas variáveis de ambiente existentes
    volumes:
      - ./back/uploads:/app/uploads
    networks:
      - erp-network
    depends_on:
      - database

  database:
    image: postgres:15-alpine
    container_name: erp-database
    restart: unless-stopped
    environment:
      # Use suas configurações atuais do banco
      POSTGRES_DB: seu_banco_atual
      POSTGRES_USER: seu_usuario_atual
      POSTGRES_PASSWORD: sua_senha_atual
    volumes:
      - postgres_data:/var/lib/postgresql/data
      # Importar banco existente (opcional)
      - ./backup.sql:/docker-entrypoint-initdb.d/backup.sql
    ports:
      - "5432:5432"
    networks:
      - erp-network

volumes:
  postgres_data:

networks:
  erp-network:
    driver: bridge
```

### 4. Migrar Banco de Dados (Opcional)

Se quiser migrar o banco atual para o container:

```bash
# Fazer backup do banco atual
pg_dump -h localhost -U seu_usuario seu_banco > backup.sql

# Colocar o backup na pasta da aplicação
# O Docker vai importar automaticamente na primeira execução
```

### 5. Ajustar Nginx

Edite sua configuração atual do Nginx para apontar para os containers:

```bash
# Editar configuração existente
nano /etc/nginx/sites-available/erp-idiomas
```

**Ajustar para:**
```nginx
# Frontend (erp.vision.dev.br)
server {
    listen 443 ssl;
    server_name erp.vision.dev.br;
    
    # Seus certificados SSL existentes
    ssl_certificate /caminho/para/seu/certificado;
    ssl_certificate_key /caminho/para/sua/chave;

    location / {
         proxy_pass http://localhost:5051;  # Container do frontend
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend (erpapi.vision.dev.br)
server {
    listen 443 ssl;
    server_name erpapi.vision.dev.br;
    
    # Seus certificados SSL existentes
    ssl_certificate /caminho/para/seu/certificado;
    ssl_certificate_key /caminho/para/sua/chave;

    location / {
         proxy_pass http://localhost:5052;  # Container do backend
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 6. Parar Sistema Atual e Subir Docker

```bash
# Parar aplicação atual (ajuste conforme seu setup)
systemctl stop sua-aplicacao-frontend
systemctl stop sua-aplicacao-backend
# ou
pm2 stop all

# Subir com Docker (UM COMANDO SÓ!)
docker-compose up -d --build

# Verificar se subiu
docker-compose ps
docker-compose logs -f
```

## 🎯 **Agora é só UM comando!**

Depois de configurado, para rodar o sistema completo:

```bash
# Subir tudo (frontend + backend + banco)
docker-compose up -d

# Ver se está rodando
docker-compose ps

# Ver logs
docker-compose logs -f
```

**Não precisa mais de PM2!** O Docker gerencia tudo automaticamente.

### 7. Testar e Recarregar Nginx

```bash
# Testar configuração
nginx -t

# Recarregar Nginx
systemctl reload nginx

# Testar os domínios
curl -I https://erp.vision.dev.br
curl -I https://erpapi.vision.dev.br
```

### 8. Comandos Úteis

```bash
# Ver status dos containers
docker-compose ps

# Ver logs
docker-compose logs -f

# Reiniciar apenas um serviço
docker-compose restart backend
docker-compose restart frontend

# Parar tudo
docker-compose down

# Subir novamente
docker-compose up -d

# Rebuild apenas um serviço
docker-compose up -d --build backend
```

### 9. Deploy Automático (do seu PC)

Configure o `deploy.config.js` com seus dados:

```javascript
module.exports = {
  server: {
    host: 'erp.vision.dev.br',  // ou o IP do seu VPS
    username: 'root',
    port: 22,
    privateKey: '~/.ssh/id_rsa',
  },
  paths: {
    app: '/caminho/para/sua/aplicacao',  // onde estão as pastas front e back
    backup: '/opt/backups/erp-idiomas'
  }
};
```

Depois use:
```bash
# Deploy rápido (só backend)
npm run deploy:quick

# Deploy completo
npm run deploy
```

## 🚨 Troubleshooting

### Container não sobe
```bash
# Ver logs detalhados
docker-compose logs nome-do-container

# Verificar portas em uso
  netstat -tlnp | grep :5052
  netstat -tlnp | grep :5051
```

### Nginx não conecta
```bash
# Verificar se containers estão rodando
docker-compose ps

# Testar conexão local
  curl http://localhost:5052  # backend
  curl http://localhost:5051  # frontend
```

### Migração do banco
```bash
# Se der erro na migração, restaurar manualmente
docker-compose exec database psql -U seu_usuario -d seu_banco -f /docker-entrypoint-initdb.d/backup.sql
```