const express = require('express');
const fileUpload = require('express-fileupload');
const { getCreatorDashboard, updateVideoStatus } = require('../controllers/adminController');
const { uploadVideo } = require('../controllers/uploadController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Middleware para manejar archivos configurado GLOBALMENTE para este router
router.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 500 * 1024 * 1024 },
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Dashboard y Gestión
router.get('/dashboard', authMiddleware, getCreatorDashboard);
router.put('/videos/:videoId', authMiddleware, updateVideoStatus);

// Subida de vídeos
router.post('/videos/upload', authMiddleware, uploadVideo);

module.exports = router;
