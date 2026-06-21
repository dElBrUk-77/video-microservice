const bcrypt = require('bcryptjs');
const { pool } = require('../db');
const { generateToken } = require('../utils/jwt');

const register = async (req, res) => {
  const { email, password, companyId } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email y password son obligatorios' });

  try {
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Por defecto, un nuevo registro es 'consumer' y membresía inactiva (a falta de pago)
    // Para el MVP de Nano, permitiremos seleccionar compañía o asignar la ID 1
    const finalCompanyId = companyId || 1; 

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, company_id, membership_active, role)
       VALUES ($1, $2, $3, false, 'consumer') RETURNING id, email, company_id, membership_active, role`,
      [email, hash, finalCompanyId]
    );

    const user = result.rows[0];
    const token = generateToken(user);
    res.json({ token, user });
  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email y password son obligatorios' });

  try {
    const result = await pool.query('SELECT id, email, password_hash, company_id, membership_active, role FROM users WHERE lower(trim(email)) = lower(trim($1)) LIMIT 1', [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'El usuario no existe' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

const profile = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, company_id, membership_active, role FROM users WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Error' }); }
};

const activate = async (req, res) => { /* ... */ res.json({ok:true}); };
const updateProfile = async (req, res) => { /* ... */ res.json({ok:true}); };
const runTestData = async (req, res) => { /* ... */ res.json({ok:true}); };

module.exports = { register, login, profile, activate, updateProfile, runTestData };
