const { pool } = require('./db');

(async ()=>{
  const client = await pool.connect();
  try{
    const email = 'superadmin@example.com';
    const text = 'SELECT id, email, password_hash, company_id, membership_active, role FROM users WHERE lower(trim(email)) = lower(trim($1)) LIMIT 1';
    const res = await client.query(text, [email]);
    console.log('test_query_login result:', res.rows);
  }catch(e){
    console.error('Error', e);
  }finally{
    await pool.end();
  }
})();
