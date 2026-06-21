const { pool } = require('./db');

(async ()=>{
  try{
    const hash = "$2b$10$1CCn7NxPOEHnlly1cXvBber9BvyXGsR5YKCT09NGpfTPJMHOETbMO";
    const emails = ['superadmin@example.com', 'platformadmin@example.com'];
    for (const e of emails) {
      const r = await pool.query('SELECT id FROM users WHERE email = $1', [e]);
      if (r.rows.length === 0) {
        console.log('No existe usuario', e);
        continue;
      }
      await pool.query('UPDATE users SET password_hash = $1, membership_active = true WHERE email = $2', [hash, e]);
      console.log('Actualizada contraseña para', e);
    }
  }catch(e){
    console.error('Error', e);
  }finally{
    await pool.end();
  }
})();
