const bcrypt = require('bcryptjs');
const { pool } = require('./db');

(async ()=>{
  try{
    const email = process.env.SUPERADMIN_EMAIL || 'superadmin@example.com';
    const password = process.env.SUPERADMIN_PASSWORD || 'SuperSecret123!';

    const r = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (r.rows.length > 0) {
      console.log('Superadmin ya existe:', email);
      return;
    }

    const hash = await bcrypt.hash(password, 10);
    const res = await pool.query('INSERT INTO users (email, password_hash, membership_active, role) VALUES ($1,$2,$3,$4) RETURNING id', [email, hash, true, 'super_admin']);
    console.log('Superadmin creado:', email, 'id=', res.rows[0].id);
  }catch(e){
    console.error('Error creando superadmin', e);
  }finally{
    await pool.end();
  }
})();
