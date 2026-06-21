const bcrypt = require('bcryptjs');
const { pool } = require('./db');

(async () => {
  try {
    console.log('--- TEST DE AUTENTICACIÓN DIRECTA ---');
    const email = 'consumer@example.com';
    const password = 'Password123!';

    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (res.rows.length === 0) {
      console.log('❌ Error: El usuario', email, 'no existe en la base de datos.');
      return;
    }

    const user = res.rows[0];
    console.log('✅ Usuario encontrado en BD:', user.email, '| Rol:', user.role);

    const match = await bcrypt.compare(password, user.password_hash);
    if (match) {
      console.log('✅ MATCH! La contraseña es CORRECTA y el bcrypt coincide.');
    } else {
      console.log('❌ ERROR BCRYPT: La contraseña no coincide con el hash.');
    }
  } catch (err) {
    console.error('Error Fatal:', err);
  } finally {
    await pool.end();
  }
})();
