# PROJECT_DOCUMENTATION.md - Video Platform B2B2C

## 🚀 Visión General
Plataforma de Video On Demand (VOD) bajo demanda con modelo de negocio B2B2C. Permite a los creadores de contenido (Compañías) gestionar su propio catálogo de vídeos protegidos, mientras que los consumidores (Alumnos) acceden a una experiencia social y segura.

---

## 🛠️ Arquitectura Técnica

### Core del Sistema
- **Backend:** Node.js (Express) con motor de transcodificación FFmpeg.
- **Frontend:** HTML5 Premium con Tailwind CSS y Hls.js para reproducción segura.
- **Base de Datos:** PostgreSQL para persistencia de identidades, metadatos e interacciones.
- **Infraestructura:** Docker Compose (Frontend en Nginx, Backend en Node, DB en Postgres).

### Seguridad "Anti-Descarga"
El sistema no sirve archivos MP4. Utiliza el estándar **HLS (HTTP Live Streaming)**:
1. El creador sube un MP4.
2. El motor lo trocea en fragmentos `.ts` de 10 segundos.
3. Se genera un manifiesto `.m3u8`.
4. El streaming solo es accesible mediante un **Token JWT** válido, impidiendo la descarga directa desde el navegador.

---

## 👥 Roles y Permisos (RBAC)

| Rol | Alcance | Destino de Login |
| :--- | :--- | :--- |
| **SuperAdmin** | Control total de usuarios, roles y todas las empresas. | `/super.html` |
| **Creator** | Gestión de vídeos, notas de autor y analíticas de su marca. | `/admin.html` |
| **Consumer** | Acceso al catálogo de vídeos y red social (si está activo). | `/index.html` |

---

## 💬 Capa Social y Colaborativa
- **Comentarios:** Hilos de conversación reales en cada vídeo. Los creadores aparecen con etiqueta `[CREADOR]`.
- **Likes/Favoritos:** Sistema persistente de engagement único por usuario/vídeo.
- **Pestaña Favoritos:** Filtrado dinámico para que el usuario guarde su contenido preferido.
- **Moderación:** Capacidad para Superadmins y Creadores de eliminar comentarios inapropiados.

---

## 📊 Manual de Operaciones

### Despliegue de Emergencia
Si el sistema requiere un reset total manteniendo el código nuevo:
```bash
./FULL_RESET.sh
```

### Inyección de Datos (Caruncho Academy)
Para poblar el sistema con 12 lecciones de prueba funcionales:
```bash
./SEED_ACADEMY.sh
```

### Gestión de Usuarios
Desde el **Panel de SuperControl**, el Superadmin puede:
1. Crear nuevos usuarios con contraseña personalizada.
2. Cambiar roles al vuelo.
3. Activar/Desactivar el "Muro de Pago" manualmente mediante el toggle de membresía.

---

## 🤖 Integración de Mensajería
- **Telegram Bot (@Delbruk_bot):** OpenClaw está vinculado para permitir la supervisión remota del sistema y notificaciones de actividad crítica.

---

## 📁 Estructura de Archivos Crítica
- `/services/controllers/`: Lógica de negocio (Auth, Social, Superadmin, Upload).
- `/services/utils/run_transcode.js`: El cerebro del motor HLS.
- `/private_videos/`: Carpeta (volumen) donde reside el contenido troceado.
- `/frontend/index.html`: Portal principal y Landing Page reactiva.
