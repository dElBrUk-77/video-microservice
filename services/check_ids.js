const { pool } = require('./db');

(async ()=>{
  try{
    const ids = [6,10];
    const r = await pool.query('SELECT id,email,password_hash,role,membership_active FROM users WHERE id = ANY($1)', [ids]);
    console.log('Rows for ids', ids, ':');
    r.rows.forEach(r => console.log(r));
  }catch(e){
    console.error('Error', e);
  }finally{
    await pool.end();
  }
})();
