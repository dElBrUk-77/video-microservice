const { pool } = require('../db');
const { sendTelegramNotification } = require('../utils/telegram');

const getVideoComments = async (req, res) => {
  try {
    const { videoId } = req.params;
    const result = await pool.query(`
      SELECT c.*, u.email as author_email, u.role as author_role
      FROM video_comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.video_id = $1
      ORDER BY c.created_at DESC
    `, [videoId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Error' }); }
};

const postComment = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { content } = req.body;
    const userEmail = req.user.email;

    const result = await pool.query(
      'INSERT INTO video_comments (video_id, author_id, content) VALUES ($1, $2, $3) RETURNING *',
      [videoId, req.user.id, content]
    );

    // Notificar al creador/admin por Telegram
    sendTelegramNotification(`💬 *Nuevo Comentario*\nUsuario: ${userEmail}\nVideo ID: ${videoId}\nContenido: ${content}`);

    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Error' }); }
};

const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { role, companyId } = req.user;
    if (role === 'super_admin') {
      await pool.query('DELETE FROM video_comments WHERE id = $1', [commentId]);
    } else {
      await pool.query(`
        DELETE FROM video_comments WHERE id = $1 
        AND video_id IN (SELECT id FROM videos WHERE company_id = $2)
      `, [commentId, companyId]);
    }
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Error' }); }
};

const toggleInteraction = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { type } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;
    const column = type === 'like' ? 'liked' : 'is_favorite';

    await pool.query(`
      INSERT INTO video_interactions (user_id, video_id, ${column})
      VALUES ($1, $2, true)
      ON CONFLICT (user_id, video_id) 
      DO UPDATE SET ${column} = NOT video_interactions.${column}
    `, [userId, videoId]);

    // Notificar interacción positiva
    if (type === 'like') {
        sendTelegramNotification(`❤️ *Nuevo Like*\nUsuario: ${userEmail}\nVideo ID: ${videoId}`);
    }

    const status = await pool.query(
      'SELECT liked, is_favorite FROM video_interactions WHERE user_id = $1 AND video_id = $2',
      [userId, videoId]
    );
    res.json(status.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Error' }); }
};

module.exports = { getVideoComments, postComment, deleteComment, toggleInteraction };
