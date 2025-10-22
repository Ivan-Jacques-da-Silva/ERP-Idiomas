# Use Node.js 18 LTS como base
FROM node:18-alpine

# Instalar PM2 globalmente
RUN npm install -g pm2

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências de produção
RUN npm ci --only=production

# Copiar arquivos de configuração e código
COPY . .

# Criar diretório de logs
RUN mkdir -p logs

# Build stage - Skip build for now since build-production.js doesn't exist
# RUN npm run build

# Expor porta do backend
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "server/index.js"]