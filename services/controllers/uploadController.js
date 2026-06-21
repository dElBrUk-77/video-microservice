const { pool } = require('../db');
const { processVideoToHLS } = require('../utils/run_transcode');
const path = require('path');
const fs = require('fs');

const uploadVideo = async (req, res) => {
  try {
    const { title, description, companyId: targetCompanyId } = req.body;
    const { companyId: userCompanyId, role } = req.user;
    const finalCompanyId = (role === 'super_admin') ? targetCompanyId : userCompanyId;

    if (!finalCompanyId) return res.status(400).json({ error: 'Falta ID de compañía' });
    if (!req.files || !req.files.video) return res.status(400).json({ error: 'No hay archivo' });

    const videoFile = req.files.video;
    const videoId = `vid_${Date.now()}`;
    
    // Asegurar directorio temporal
    const tempDir = '/app/temp';
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    const tempPath = path.join(tempDir, `${videoId}_${videoFile.name}`);
    await videoFile.mv(tempPath);

    // Procesar a volumen interno
    await processVideoToHLS(tempPath, videoId);

    const result = await pool.query(
      'INSERT INTO videos (company_id, title, description, url, is_published) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [finalCompanyId, title, description || '', videoId, false]
    );

    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.json({ ok: true, videoId: result.rows[0].id });

  } catch (err) {
    console.error('Microservice Upload Error:', err);
    res.status(500).json({ error: 'Error: ' + err.message });
  }
};

module.exports = { uploadVideo };
