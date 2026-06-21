const { pool } = require('./db');
const bcrypt = require('bcryptjs');

(async ()=>{
  try{
    const r = await pool.query("SELECT password_hash FROM users WHERE email = $1", ['superadmin@example.com']);
    if(r.rows.length===0){
      console.log('No existe superadmin');
      return;
    }
    const hash = r.rows[0].password_hash;
    const ok = await bcrypt.compare('Password123!', hash);
    console.log('bcrypt compare result:', ok);
  }catch(e){
    console.error('Error', e);
  }finally{
    await pool.end();
  }
})();
