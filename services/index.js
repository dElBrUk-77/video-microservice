const path = require('path');
// load .env explicitly from the services directory so cwd doesn't matter
require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = require('./app');

// small debug: print DB env vars at startup to validate which DB the running process uses
const { DB_HOST, DB_PORT, DB_USER, DB_NAME } = process.env;
console.log('DB connection env:', { DB_HOST, DB_PORT, DB_USER, DB_NAME });

// Run a quick sanity check from the server process to show what this process sees in the DB
try{
  const { pool } = require('./db');
  (async ()=>{
    try{
      const dbname = await pool.query('SELECT current_database()');
      console.log('startup-sanity: current_database()', dbname.rows[0]);
      const cnt = await pool.query('SELECT COUNT(*)::int AS users_count FROM users');
      console.log('startup-sanity: users_count =', cnt.rows[0].users_count);
      const rows = await pool.query('SELECT id,email,role FROM users WHERE id = ANY($1) ORDER BY id', [[6,10]]);
      console.log('startup-sanity: sample rows for ids 6 and 10:', rows.rows);
    }catch(e){
      console.log('startup-sanity: error running sanity queries', e && e.message);
    }
  })();
}catch(e){
  console.log('startup-sanity: could not require pool', e && e.message);
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Auth service escuchando en http://localhost:${PORT}`);
});
