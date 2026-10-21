# ⚽ Modo Carrera FC App

Aplicación web interactiva y completa para la gestión y seguimiento de carreras en juegos de fútbol (EA Sports FC / FIFA). Permite administrar múltiples clubes, temporadas, plantillas de jugadores, calendarios de partidos con estadísticas detalladas (goles, asistencias, tarjetas, valoraciones), palmarés, premios y finanzas.

---

## 🚀 Despliegue y Ejecución con Docker (Recomendado)

La aplicación incluye soporte completo para Docker mediante una compilación multi-stage optimizada y un servidor Node ligero que sirve la web y la API de sincronización.

### Opción 1: Usando Docker Compose

1. **Iniciar el contenedor:**
   ```bash
   docker compose up -d --build
   ```

2. **Abrir en el navegador:**
   Accede a [http://localhost:3002](http://localhost:3002)

3. **Detener el contenedor:**
   ```bash
   docker compose down
   ```

---

### Opción 2: Usando Docker CLI directamente

1. **Construir la imagen:**
   ```bash
   docker build -t modo-carrera-fc-app .
   ```

2. **Ejecutar el contenedor:**
   ```bash
   docker run -d -p 3002:80 -v $(pwd)/data:/app/data --name modo-carrera-fc-app modo-carrera-fc-app
   ```

3. **Detener y eliminar el contenedor:**
   ```bash
   docker stop modo-carrera-fc-app && docker rm modo-carrera-fc-app
   ```

---

## ☁️ Sincronización entre Dispositivos en Docker

La imagen Docker usa un pequeño servidor Node sin dependencias (`server.mjs`) que sirve la web y la API `/api/cloud-db` (la misma que el plugin de Vite en desarrollo y la función de Vercel). Los datos de cada usuario se guardan como JSON en `./data` (volumen), de modo que la carrera se sincroniza entre el iPhone, el Mac y cualquier navegador.

- Healthcheck: `GET /healthz`
- Copia de seguridad: basta con copiar la carpeta `data/`.

## 💻 Desarrollo Local (Sin Docker)

Si deseas ejecutar o modificar el proyecto localmente con Node.js:

### Requisitos
- Node.js 18+ o 20+
- npm

### Pasos

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

3. **Construir para producción manualmente:**
   ```bash
   npm run build
   ```

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React 18, Vite 6, Tailwind CSS, Lucide Icons.
- **Servidor Web Producción:** Node 20 Alpine con `server.mjs` (Gzip, Headers de Seguridad, Caché de estáticos, soporte SPA y API de sincronización).
- **Contenedor:** Docker / Docker Compose (Multi-stage build con Node.js 20).
- **Almacenamiento:** LocalStorage en el navegador y sincronización en la nube opcional.
