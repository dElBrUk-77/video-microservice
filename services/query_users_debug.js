const { pool } = require('./db');

(async ()=>{
  try{
    console.log('All users (id,email):');
    const all = await pool.query('SELECT id, email, password_hash FROM users ORDER BY id');
    all.rows.forEach(r => console.log(r));

    console.log('\nUsers where email = superadmin@example.com:');
    const s = await pool.query("SELECT id, email, password_hash FROM users WHERE email = $1 ORDER BY id", ['superadmin@example.com']);
    s.rows.forEach(r => console.log(r));

    console.log('\nCount per email (show dupes):');
    const dup = await pool.query("SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1");
    console.log(dup.rows);
  }catch(e){
    console.error('Error', e);
  }finally{
    await pool.end();
  }
})();
