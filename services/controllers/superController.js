const { pool } = require('../db');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'No autorizado' });
    const result = await pool.query(`
      SELECT u.id, u.email, u.role, u.membership_active, u.company_id, c.name as company_name 
      FROM users u 
      LEFT JOIN companies c ON u.company_id = c.id 
      ORDER BY u.id ASC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Error al listar usuarios' }); }
};

// CREAR USUARIO (Nuevo)
const superCreateUser = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'No autorizado' });
    const { email, password, role, membership_active, company_id } = req.body;
    
    const hash = await bcrypt.hash(password || 'Password123!', 10);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role, membership_active, company_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [email, hash, role, membership_active, company_id || null]
    );
    res.json({ ok: true, userId: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear usuario: ' + err.message });
  }
};

const superUpdateUser = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'No autorizado' });
    const { userId } = req.params;
    const { email, role, membership_active, company_id, password } = req.body;

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, userId]);
    }

    await pool.query(
      `UPDATE users SET email = $1, role = $2, membership_active = $3, company_id = $4 WHERE id = $5`,
      [email, role, membership_active, company_id || null, userId]
    );

    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Error al actualizar usuario' }); }
};

const getAllCompanies = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'No autorizado' });
    const result = await pool.query('SELECT id, name FROM companies ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Error' }); }
};

module.exports = { getAllUsers, superUpdateUser, getAllCompanies, superCreateUser };
