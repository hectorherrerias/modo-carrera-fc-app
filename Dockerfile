# ==========================================
# Etapa 1: Construcción (Build)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias limpias
RUN npm ci

# Copiar el código fuente
COPY . .

# Compilar la aplicación para producción
RUN npm run build

# ==========================================
# Etapa 2: Servidor de Producción (Node, sin dependencias)
# Sirve la web y la API /api/cloud-db de sincronización entre dispositivos
# ==========================================
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production \
    PORT=80 \
    DIST_DIR=/app/dist \
    DATA_DIR=/app/data

# Copiar los archivos compilados y el servidor
COPY --from=builder /app/dist ./dist
COPY server.mjs ./server.mjs

# Directorio persistente para los datos sincronizados (montado como volumen)
RUN mkdir -p /app/data && chown -R node:node /app/data

# Puerto 80 sin root
RUN apk add --no-cache libcap && setcap 'cap_net_bind_service=+ep' /usr/local/bin/node && apk del libcap

USER node

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/healthz || exit 1

CMD ["node", "server.mjs"]
