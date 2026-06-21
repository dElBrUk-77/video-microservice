const { pool } = require('../db');

// Returns companies with nested admins and consumers
const listCompaniesWithUsers = async (req, res) => {
  try {
    // only platform_admin or super_admin can access all companies
    const user = req.user;
    if (!(user.role === 'platform_admin' || user.role === 'super_admin')) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const companiesRes = await pool.query('SELECT id, name, code, description FROM companies');
    const companies = companiesRes.rows;

    // for each company, fetch admins and consumers
    const result = [];
    for (const comp of companies) {
      const adminsRes = await pool.query('SELECT id, email, role FROM users WHERE company_id = $1 AND role != $2', [comp.id, 'consumer']);
      const consumersRes = await pool.query('SELECT id, email, membership_active FROM users WHERE company_id = $1 AND role = $2', [comp.id, 'consumer']);
      result.push({ ...comp, admins: adminsRes.rows, consumers: consumersRes.rows });
    }

    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

module.exports = { listCompaniesWithUsers };
