const { pool } = require('../db');
const { processVideoToHLS } = require('../utils/run_transcode');
const path = require('path');
const fs = require('fs');

const uploadVideo = async (req, res) => {
  try {
    const { title, description, companyId: targetCompanyId } = req.body;
    const { companyId: userCompanyId, role } = req.user;
    
    // DETERMINAR COMPAÑÍA DESTINO
    // Si es superadmin, usa la que viene en el body. Si es creador, usa la suya propia.
    const finalCompanyId = (role === 'super_admin') ? targetCompanyId : userCompanyId;

    if (!finalCompanyId) {
      return res.status(400).json({ error: 'Falta ID de compañía para asignar el vídeo' });
    }

    if (role !== 'creator' && role !== 'super_admin' && role !== 'company_admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    if (!req.files || !req.files.video) {
      return res.status(400).json({ error: 'No hay archivo de vídeo' });
    }

    const videoFile = req.files.video;
    const videoId = `vid_${Date.now()}`;
    const tempDir = path.join('/app', 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    const tempPath = path.join(tempDir, `${videoId}_${videoFile.name}`);
    await videoFile.mv(tempPath);

    await processVideoToHLS(tempPath, videoId);

    const result = await pool.query(
      'INSERT INTO videos (company_id, title, description, url, is_published) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [finalCompanyId, title, description || '', videoId, false]
    );

    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

    res.json({ ok: true, videoId: result.rows[0].id });

  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: 'Error en servidor: ' + err.message });
  }
};

module.exports = { uploadVideo };
