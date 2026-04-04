const { Router } = require('express');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { createPatient, createOrder } = require('./his.controller');

const router = Router();

router.use(authMiddleware);

router.post('/patients', createPatient);
router.post('/orders', createOrder);

module.exports = router;
