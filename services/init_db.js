const { pool } = require('./db');

const sql = `
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  company_id INTEGER REFERENCES companies(id),
  membership_active BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'consumer',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS videos (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample company if not exists
INSERT INTO companies (id, name)
  SELECT 1, 'Acme Corp'
  WHERE NOT EXISTS (SELECT 1 FROM companies WHERE id = 1);

`;

(async ()=>{
  try{
    await pool.query(sql);
    console.log('Tablas creadas / verificadas');
  }catch(e){
    console.error('Error creando tablas', e);
  }finally{
    await pool.end();
  }
})();
