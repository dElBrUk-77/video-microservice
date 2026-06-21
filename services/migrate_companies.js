const { pool } = require('./db');

(async ()=>{
  try{
    // Añadir columnas si no existen
    await pool.query("ALTER TABLE companies ADD COLUMN IF NOT EXISTS code TEXT");
    await pool.query("ALTER TABLE companies ADD COLUMN IF NOT EXISTS description TEXT");
    // Asegurar que code tenga algún valor para las empresas existentes
    await pool.query("UPDATE companies SET code = CONCAT('C', id) WHERE code IS NULL");
    console.log('Migración companies OK');
  }catch(e){
    console.error('Error migrando companies', e);
  }finally{
    await pool.end();
  }
})();
