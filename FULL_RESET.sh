#!/bin/bash
echo "--- INICIANDO RESET TOTAL DEL MVP ---"
cd /home/nano/proyectos/video-platform

# 1. Limpieza absoluta
sudo docker compose down -v
sudo docker system prune -f

# 2. Reconstrucción desde cero (esto mete el código nuevo en la imagen)
sudo docker compose build --no-cache
sudo docker compose up -d

# 3. Esperar a la DB e inyectar datos
echo "Esperando a la base de datos..."
sleep 10
sudo docker cp ./services/setup_test_users.js video-platform-backend-1:/app/setup_test_users.js
sudo docker compose exec backend node setup_test_users.js

echo "--- VALIDACIÓN DE USUARIOS ---"
sudo docker compose exec backend node -e "
const { pool } = require('./db');
pool.query('SELECT email, role, membership_active FROM users').then(res => {
  console.log('Usuarios reales en BD:', res.rows);
  process.exit(0);
});"
