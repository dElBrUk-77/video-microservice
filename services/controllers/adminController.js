const { pool } = require('../db');

const getCreatorDashboard = async (req, res) => {
  try {
    const { companyId, role } = req.user;
    
    // Consulta real con conteo de interacciones
    let query = `
      SELECT v.*, 
        (SELECT COUNT(*) FROM video_interactions WHERE video_id = v.id AND liked = true) as likes,
        (SELECT COUNT(*) FROM video_interactions WHERE video_id = v.id AND is_favorite = true) as favs
      FROM videos v
    `;
    let params = [];

    if (role !== 'super_admin') {
      query += ' WHERE v.company_id = $1';
      params.push(companyId);
    }
    
    query += ' ORDER BY v.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Dashboard Error:', err);
    res.status(500).json({ error: 'Error al obtener datos reales' });
  }
};

const updateVideoStatus = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { is_published, creator_notes } = req.body;
    const { companyId, role } = req.user;

    // Verificar propiedad antes de editar
    const check = await pool.query('SELECT company_id FROM videos WHERE id = $1', [videoId]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Vídeo no encontrado' });
    
    if (role !== 'super_admin' && check.rows[0].company_id !== companyId) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    await pool.query(
      'UPDATE videos SET is_published = $1, creator_notes = $2 WHERE id = $3',
      [is_published, creator_notes, videoId]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('Update Error:', err);
    res.status(500).json({ error: 'Error al actualizar' });
  }
};

module.exports = { getCreatorDashboard, updateVideoStatus };
