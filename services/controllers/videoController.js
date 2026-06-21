const { pool } = require('../db');

const listCompanyVideos = async (req, res) => {
  try {
    const { companyId, role } = req.user;

    // Los consumidores solo ven videos publicados de su compañía
    // El superadmin y el creador pueden verlo todo (para gestión)
    let query = 'SELECT * FROM videos WHERE company_id = $1';
    let params = [companyId];

    if (role === 'consumer') {
      query += ' AND is_published = true';
    }

    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error listing videos:', err);
    res.status(500).json({ error: 'Error al obtener el catálogo' });
  }
};

module.exports = { listCompanyVideos };
