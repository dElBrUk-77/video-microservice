const { pool } = require('../db');

// Obtener solo los videos favoritos del usuario
const getFavoriteVideos = async (req, res) => {
  try {
    const userId = req.user.id;
    const { companyId } = req.user;

    const result = await pool.query(`
      SELECT v.* 
      FROM videos v
      JOIN video_interactions vi ON v.id = vi.video_id
      WHERE vi.user_id = $1 AND vi.is_favorite = true AND v.company_id = $2
      ORDER BY v.created_at DESC
    `, [userId, companyId]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
};

// Obtener el estado actual de like/fav para el video activo
const getVideoStatus = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT liked, is_favorite FROM video_interactions WHERE user_id = $1 AND video_id = $2',
      [userId, videoId]
    );
    res.json(result.rows[0] || { liked: false, is_favorite: false });
  } catch (err) {
    res.status(500).json({ error: 'Error de estado' });
  }
};

module.exports = { getFavoriteVideos, getVideoStatus };
