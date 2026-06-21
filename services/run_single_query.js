const { pool } = require('./db');

(async ()=>{
  try{
    const email = 'superadmin@example.com';
    const r = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    console.log('single query rows:', JSON.stringify(r.rows, null, 2));
  }catch(e){
    console.error('Error', e);
  }finally{
    await pool.end();
  }
})();
