const { Router } = require('express');
const {
  authMiddleware,
  requireRole,
} = require('../../middleware/auth.middleware');
const { createDoctor, listDoctors } = require('./admin.controller');

const router = Router();

router.use(authMiddleware);

router.post('/doctors', requireRole('ADMIN'), createDoctor);
router.get('/doctors', requireRole('ADMIN'), listDoctors);

module.exports = router;
