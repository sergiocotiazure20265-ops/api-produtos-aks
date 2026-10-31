# Imagem base do Node.js
FROM node:22-alpine

# Diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --omit=dev

# Copiar código da aplicação
COPY src ./src

# Porta utilizada pela API
EXPOSE 3000

# Inicializar a API
CMD ["node", "src/app.js"]