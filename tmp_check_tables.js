const { pool } = require('./services/db');
(async ()=>{
  try{
    const r = await pool.query("SELECT to_regclass('public.users') AS exists");
    console.log(r.rows);
  }catch(e){
    console.error(e);
  }finally{
    pool.end();
  }
})();
