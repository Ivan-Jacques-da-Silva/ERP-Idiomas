# Estágio 1: Build da aplicação
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Fazer build da aplicação
RUN npm run build

# Estágio 2: Servir arquivos estáticos com Nginx
FROM nginx:alpine

# Copiar arquivos buildados do estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do Nginx (opcional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expor porta 80
EXPOSE 80

# Comando padrão do Nginx
CMD ["nginx", "-g", "daemon off;"]