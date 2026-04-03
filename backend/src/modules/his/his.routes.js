const { Router } = require('express');
const { createPatient, createOrder } = require('./his.controller');

const router = Router();

// Open endpoints — no auth required (demo/simulator use)
router.post('/patients', createPatient);
router.post('/orders', createOrder);

module.exports = router;
