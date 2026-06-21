const express = require('express');
const { getAllUsers, superUpdateUser, getAllCompanies, superCreateUser } = require('../controllers/superController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Rutas exclusivas para Superadmin
router.get('/users', authMiddleware, getAllUsers);
router.post('/users', authMiddleware, superCreateUser);
router.put('/users/:userId', authMiddleware, superUpdateUser);
router.get('/companies', authMiddleware, getAllCompanies);

module.exports = router;
