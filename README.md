# Video Platform - B2B2C MVP

Plataforma de video bajo demanda (VOD) con modelo multi-tenant para creadores. Incluye protección anti-descarga (HLS) y pagos directos mediante Stripe Connect.

## Arquitectura (N3)
- **Frontend:** HTML5/Tailwind + HLS.js (Servido por Nginx)
- **Backend:** Node.js + Express + FFmpeg (Streaming Seguro)
- **Base de Datos:** PostgreSQL
- **Orquestación:** Docker Compose

## Despliegue Rápido (DAVINCI)

El proyecto está diseñado para arrancar con un solo comando sin instalaciones adicionales en la máquina host.

1. **Configurar el entorno:**
   ```bash
   cp .env.example .env
   # Edita el archivo .env con tus claves reales de Stripe y secretos JWT.
   ```

2. **Levantar la plataforma:**
   ```bash
   docker compose up -d --build
   ```

El sistema estará disponible en:
- **Aplicación (Frontend):** `http://localhost:3000`
- **API (Backend):** `http://localhost:4000`

## Notas de Seguridad (HACKERITO)
- El contenedor del backend corre bajo un usuario no-root (`node`).
- Las contraseñas se almacenan hasheadas con `bcrypt`.
- Los videos directos (MP4) se transcodifican a HLS (`.m3u8` / `.ts`) y se sirven mediante URLs con JWT temporal para evitar descargas.
