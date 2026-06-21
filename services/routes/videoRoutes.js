const express = require('express');
const { listCompanyVideos } = require('../controllers/videoController');
const { serveStreamChunk } = require('../controllers/streamController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, listCompanyVideos);
router.get('/stream/:videoId/:file', serveStreamChunk); // La auth se hace por token en query o header

module.exports = router;
