const { pool } = require('./db');

(async ()=>{
  try{
    const email = 'superadmin@example.com';
    const testHash = '$2b$10$1CCn7NxPOEHnlly1cXvBber9BvyXGsR5YKCT09NGpfTPJMHOETbMO';
    // check existence
    const r = await pool.query('SELECT id, email, role, membership_active, password_hash FROM users WHERE lower(trim(email)) = lower(trim($1)) LIMIT 1', [email]);
    if(r.rows.length === 0){
      console.log('superadmin not found, inserting...');
      const ins = await pool.query(
        `INSERT INTO users (email, password_hash, company_id, membership_active, role, created_at)
         VALUES ($1,$2,NULL,true,'super_admin',NOW()) RETURNING id, email, role`,
         [email, testHash]
      );
      console.log('Inserted:', ins.rows[0]);
    } else {
      const u = r.rows[0];
      console.log('Found user:', u);
      // update role/hash/membership if differs
      const updates = [];
      const params = [];
      params.push(email); // where param
      if(u.password_hash !== testHash){
        await pool.query('UPDATE users SET password_hash=$1 WHERE lower(trim(email)) = lower(trim($2))', [testHash, email]);
        console.log('Updated password_hash for', email);
      }
      if(u.role !== 'super_admin' || !u.membership_active){
        await pool.query('UPDATE users SET role=$1, membership_active=true WHERE lower(trim(email)) = lower(trim($2))', ['super_admin', email]);
        console.log('Updated role/membership for', email);
      }
    }
  }catch(e){
    console.error('Error ensuring superadmin', e);
  }finally{
    await pool.end();
  }
})();
