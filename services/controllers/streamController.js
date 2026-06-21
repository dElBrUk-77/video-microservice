// streamController.js
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const serveStreamChunk = async (req, res) => {
  try {
    const { videoId, file } = req.params;
    const token = req.query.token || req.headers['authorization']?.split(' ')[1];

    if (!token) {
      console.log('Stream Error: No token provided');
      return res.status(403).json({ error: 'Token requerido' });
    }

    // Validar JWT
    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      console.log('Stream Error: Invalid Token', e.message);
      return res.status(403).json({ error: 'Token inválido' });
    }

    // LOCALIZACIÓN DEL VIDEO: 
    // En Docker, private_videos está mapeado a /app/private_videos
    const filePath = path.join('/app', 'private_videos', videoId, file);
    
    if (!fs.existsSync(filePath)) {
      console.log('Stream Error: File not found ->', filePath);
      return res.status(404).send('Chunk not found');
    }

    if (file.endsWith('.m3u8')) res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    else if (file.endsWith('.ts')) res.setHeader('Content-Type', 'video/MP2T');

    res.setHeader('Access-Control-Allow-Origin', '*');

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);

  } catch (err) {
    console.error('Stream Global Error:', err.message);
    res.status(500).json({ error: 'Error interno en el stream' });
  }
};

module.exports = { serveStreamChunk };
