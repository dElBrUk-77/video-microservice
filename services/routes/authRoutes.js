const express = require('express');
const { register, login, profile, activate, updateProfile, runTestData } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, profile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/activate', authMiddleware, activate);
router.post('/run-test-data', authMiddleware, runTestData);

module.exports = router;
