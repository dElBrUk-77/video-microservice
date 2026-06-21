const express = require('express');
const { getVideoComments, postComment, deleteComment, toggleInteraction } = require('../controllers/socialController');
const { getFavoriteVideos, getVideoStatus } = require('../controllers/interactionController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/favorites', authMiddleware, getFavoriteVideos);
router.get('/:videoId/status', authMiddleware, getVideoStatus);
router.get('/:videoId/comments', authMiddleware, getVideoComments);
router.post('/:videoId/comments', authMiddleware, postComment);
router.delete('/comments/:commentId', authMiddleware, deleteComment);
router.post('/:videoId/interact', authMiddleware, toggleInteraction);

module.exports = router;
