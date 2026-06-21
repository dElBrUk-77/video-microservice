const { pool } = require('./db');

(async ()=>{
  try{
    const r = await pool.query('SELECT id,email,role,membership_active FROM users ORDER BY id');
    console.log(r.rows);
  }catch(e){
    console.error('Error', e);
  }finally{
    await pool.end();
  }
})();
