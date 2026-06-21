const bcrypt = require('bcryptjs');
const { pool } = require('./db');

(async ()=>{
  try{
    // Companies
    const companies = ['Acme Corp', 'Globex', 'Initech'];
    for (let i=0;i<companies.length;i++){
      const name = companies[i];
      const exists = await pool.query('SELECT id FROM companies WHERE name=$1', [name]);
      if (exists.rows.length === 0) {
        await pool.query('INSERT INTO companies (name) VALUES ($1)', [name]);
      }
    }

    const res = await pool.query('SELECT id, name FROM companies ORDER BY id');
    const companyRows = res.rows;

    // Users: for each company create consumer, company_admin, platform_admin
    for (const c of companyRows){
      const emailPrefix = c.name.toLowerCase().replace(/[^a-z0-9]+/g,'');
      const users = [
        { email: `${emailPrefix}_consumer@example.com`, role: 'consumer', membership_active: true },
        { email: `${emailPrefix}_company_admin@example.com`, role: 'company_admin', membership_active: true },
        { email: `${emailPrefix}_platform_admin@example.com`, role: 'platform_admin', membership_active: true }
      ];

      for (const u of users){
        const pwdHash = await bcrypt.hash('Password123!', 10);
        await pool.query(
          `INSERT INTO users (email, password_hash, company_id, membership_active, role)
           SELECT $1,$2,$3,$4,$5 WHERE NOT EXISTS (SELECT 1 FROM users WHERE email=$1)`,
          [u.email, pwdHash, c.id, u.membership_active, u.role]
        );
      }
    }

    // Videos: create 10 per company
    let totalVideos = 0;
    for (const c of companyRows){
      for (let i=1;i<=10;i++){
        const title = `Curso ${i} - ${c.name}`;
        const url = `https://example.com/videos/${c.id}/${i}.mp4`;
        await pool.query(
          `INSERT INTO videos (company_id, title, description, url)
           SELECT $1,$2,$3,$4 WHERE NOT EXISTS (SELECT 1 FROM videos WHERE company_id=$1 AND title=$2)`,
          [c.id, title, `Descripción del ${title}`, url]
        );
        totalVideos++;
      }
    }

    console.log('Seed completado:', companyRows.length, 'companies, videos:', totalVideos);
  }catch(e){
    console.error('Error seed', e);
  }finally{
    await pool.end();
  }
})();
