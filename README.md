# ⚽ Modo Carrera FC App

Aplicación web interactiva y completa para la gestión y seguimiento de carreras en juegos de fútbol (EA Sports FC / FIFA). Permite administrar múltiples clubes, temporadas, plantillas de jugadores, calendarios de partidos con estadísticas detalladas (goles, asistencias, tarjetas, valoraciones), palmarés, premios y finanzas.

---

## 🚀 Despliegue y Ejecución con Docker (Recomendado)

La aplicación incluye soporte completo para Docker mediante una compilación multi-stage optimizada y un servidor web Nginx de alto rendimiento.

### Opción 1: Usando Docker Compose

1. **Iniciar el contenedor:**
   ```bash
   docker compose up -d --build
   ```

2. **Abrir en el navegador:**
   Accede a [http://localhost:3000](http://localhost:3000)

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
   docker run -d -p 3000:80 --name modo-carrera-fc-app modo-carrera-fc-app
   ```

3. **Detener y eliminar el contenedor:**
   ```bash
   docker stop modo-carrera-fc-app && docker rm modo-carrera-fc-app
   ```

---

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
- **Servidor Web Producción:** Nginx Alpine (Gzip, Headers de Seguridad, Caché de estáticos y soporte SPA).
- **Contenedor:** Docker / Docker Compose (Multi-stage build con Node.js 20).
- **Almacenamiento:** LocalStorage en el navegador y sincronización en la nube opcional.
