const { Router } = require('express');
const { authMiddleware, requireRole } = require('../../middleware/auth.middleware');
const {
  savePacsConfig,
  saveHisConfig,
  getStatus,
  activatePacs,
  activateHis,
} = require('./integration.controller');

const router = Router();

router.use(authMiddleware);
router.post('/pacs', requireRole('ADMIN'), savePacsConfig);
router.post('/his', requireRole('ADMIN'), saveHisConfig);
router.get('/status', getStatus);
router.post('/pacs/activate', requireRole('ADMIN'), activatePacs);
router.post('/his/activate', requireRole('ADMIN'), activateHis);

module.exports = router;
