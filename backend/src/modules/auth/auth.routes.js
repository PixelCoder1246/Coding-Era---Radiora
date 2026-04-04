const { Router } = require('express');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { register, login, authStatus, logout } = require('./auth.controller');

const router = Router();

router.post('/register', register);

router.post('/login', login);
router.get('/status', authMiddleware, authStatus);
router.post('/logout', logout);

module.exports = router;
