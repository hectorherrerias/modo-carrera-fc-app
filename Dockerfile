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
# Etapa 2: Servidor Web de Producción (Nginx)
# ==========================================
FROM nginx:alpine

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos compilados desde la etapa de construcción
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto estándar HTTP
EXPOSE 80

# Iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
