const { pool } = require('./db');

(async ()=>{
  const client = await pool.connect();
  try{
    const cs = await client.query('SELECT current_schema()');
    console.log('current_schema:', cs.rows[0]);
    const tables = await client.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_name='users' ORDER BY table_schema");
    console.log('tables named users:', tables.rows);
    for(const row of tables.rows){
      const schemaName = row.table_schema;
      const q = `SELECT table_schema, id, email, password_hash, role FROM "${schemaName}".users ORDER BY id LIMIT 5`;
      try{
        const r = await client.query(q);
        console.log('sample rows from', schemaName + '.users =>', r.rows);
      }catch(e){
        console.log('error selecting from', schemaName+'.users', e.message);
      }
    }
  }catch(e){
    console.error('Error', e);
  }finally{
    client.release();
    await pool.end();
  }
})();
