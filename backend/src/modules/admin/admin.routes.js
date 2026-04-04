const { Router } = require('express');
const {
  authMiddleware,
  requireRole,
} = require('../../middleware/auth.middleware');
const {
  createDoctor,
  listDoctors,
  deleteDoctor,
  resetDoctorPassword,
} = require('./admin.controller');

const router = Router();

router.use(authMiddleware);

router.post('/doctors', requireRole('ADMIN'), createDoctor);
router.get('/doctors', requireRole('ADMIN'), listDoctors);
router.delete('/doctors/:doctorId', requireRole('ADMIN'), deleteDoctor);
router.patch(
  '/doctors/:doctorId/reset-password',
  requireRole('ADMIN'),
  resetDoctorPassword
);

module.exports = router;
