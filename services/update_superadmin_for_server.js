const { Pool } = require('pg');

(async ()=>{
  // explicit connection matching services/.env
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'fernandocaruncho',
    password: process.env.DB_PASS || '',
    database: 'video_platform'
  });

  try{
    const email = 'superadmin@example.com';
    const testHash = '$2b$10$1CCn7NxPOEHnlly1cXvBber9BvyXGsR5YKCT09NGpfTPJMHOETbMO';

    const r = await pool.query('SELECT id,email,role,membership_active,password_hash FROM users WHERE lower(trim(email)) = lower(trim($1))', [email]);
    console.log('Found rows before update:', r.rows);

    if(r.rows.length === 0){
      console.log('No superadmin row found on this connection. Inserting one.');
      const ins = await pool.query(`INSERT INTO users (email,password_hash,company_id,membership_active,role,created_at) VALUES ($1,$2,NULL,true,'super_admin',NOW()) RETURNING id,email,role`, [email,testHash]);
      console.log('Inserted:', ins.rows[0]);
    } else {
      for(const row of r.rows){
        await pool.query('UPDATE users SET password_hash=$1, role=$2, membership_active=true WHERE id=$3', [testHash, 'super_admin', row.id]);
        console.log('Updated id', row.id);
      }
    }

    const after = await pool.query('SELECT id,email,role,membership_active,password_hash FROM users WHERE lower(trim(email)) = lower(trim($1))', [email]);
    console.log('Found rows after update:', after.rows);
  }catch(e){
    console.error('Error', e);
  }finally{
    await pool.end();
  }
})();
