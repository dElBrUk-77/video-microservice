const { pool } = require('./db');

(async ()=>{
  try{
    const r = await pool.query("SELECT id,email,password_hash FROM users WHERE email = $1", ['superadmin@example.com']);
    if(r.rows.length===0){
      console.log('No existe superadmin');
    }else{
      console.log(r.rows[0]);
    }
  }catch(e){
    console.error('Error', e);
  }finally{
    await pool.end();
  }
})();
