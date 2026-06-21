#!/bin/bash
echo "--- INYECTANDO CONTENIDO PARA CARUNCHO ACADEMY ---"
cd /home/nano/proyectos/video-platform

# 1. Asegurar que existe la compañía Caruncho Academy (ID 1)
sudo docker compose exec -T db psql -U postgres -d video_platform -c "
INSERT INTO companies (id, name) VALUES (1, 'Caruncho Academy') ON CONFLICT (id) DO NOTHING;
"

# 2. Inyectar 12 vídeos reales en la base de datos
sudo docker compose exec -T db psql -U postgres -d video_platform -c "
DELETE FROM videos WHERE company_id = 1; -- Limpiar para no duplicar
INSERT INTO videos (company_id, title, description, url, is_published) VALUES 
(1, '01 - Introducción al Mercado B2B2C', 'Bienvenidos a la Caruncho Academy. Sentamos las bases del modelo de negocio.', 'vid_1', true),
(1, '02 - Arquitectura de Sistemas Premium', 'Cómo diseñar infraestructuras robustas para clientes VIP.', 'vid_2', true),
(1, '03 - Gestión de Identidad y Roles', 'Profundizamos en el control de acceso basado en roles (RBAC).', 'vid_3', true),
(1, '04 - El Arte de la Transcodificación', 'Por qué HLS es el estándar de la industria y cómo implementarlo.', 'vid_4', true),
(1, '05 - Seguridad y DRM en Streaming', 'Protegiendo tu propiedad intelectual frente a descargas ilegales.', 'vid_5', true),
(1, '06 - Estrategia de Monetización con Stripe', 'Cómo configurar cobros recurrentes y webhooks seguros.', 'vid_6', true),
(1, '07 - UX/UI para Plataformas de Lujo', 'Diseño visual que justifica el precio premium.', 'vid_7', true),
(1, '08 - Escalado de Contenedores Docker', 'Optimizando el backend para soportar miles de usuarios.', 'vid_8', true),
(1, '09 - Analíticas de Usuario Reales', 'Interpretando likes y favoritos para mejorar el contenido.', 'vid_9', true),
(1, '10 - El Futuro del Vídeo On Demand', 'Tendencias y tecnologías que dominarán en 2027.', 'vid_10', true),
(1, '11 - Masterclass: Liderazgo Tecnológico', 'Consejos directos para CTOs en entornos de alta presión.', 'vid_11', true),
(1, '12 - Cierre de Curso y Certificación', 'Próximos pasos para los alumnos de la academia.', 'vid_12', true);
"

# 3. Simular los archivos HLS para cada vídeo duplicando el test_vid
echo "Simulando archivos HLS en disco..."
for i in {1..12}; do
    sudo mkdir -p private_videos/vid_$i
    sudo cp -r private_videos/test_vid/* private_videos/vid_$i/
done
sudo chmod -R 777 private_videos

echo "✅ Caruncho Academy lista con 12 lecciones operativas."
