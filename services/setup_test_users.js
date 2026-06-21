const bcrypt = require('bcryptjs');
const { pool } = require('./db');

(async () => {
  try {
    console.log('Creando tablas si no existen...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        stripe_account_id VARCHAR(255),
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
    `);

    console.log('Insertando datos de prueba...');
    const hash = await bcrypt.hash('Password123!', 10);

    // Empresa
    let companyId = 1;
    const c = await pool.query('SELECT id FROM companies WHERE name = $1', ['Caruncho Academy']);
    if (c.rows.length === 0) {
      const resC = await pool.query('INSERT INTO companies (name, stripe_account_id) VALUES ($1, $2) RETURNING id', ['Caruncho Academy', 'acct_test123']);
      companyId = resC.rows[0].id;
    } else {
      companyId = c.rows[0].id;
    }

    // Superadmin
    await pool.query(
      `INSERT INTO users (email, password_hash, membership_active, role) 
       VALUES ($1, $2, true, 'super_admin') ON CONFLICT (email) DO NOTHING`,
      ['superadmin@example.com', hash]
    );

    // Consumidor (con membresía para ver el video)
    await pool.query(
      `INSERT INTO users (email, password_hash, company_id, membership_active, role) 
       VALUES ($1, $2, $3, true, 'consumer') ON CONFLICT (email) DO NOTHING`,
      ['consumer@example.com', hash, companyId]
    );

    console.log('✅ Base de datos inicializada y usuarios creados.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
})();
