const { Router } = require('express');
const {
  authMiddleware,
  requireRole,
} = require('../../middleware/auth.middleware');
const {
  listCases,
  getCaseById,
  assignDoctor,
  receiveAiResult,
} = require('./case.controller');
const { submitReport } = require('../report/report.controller');

const router = Router();

router.post('/:caseId/ai-result', receiveAiResult);

router.use(authMiddleware);

router.get('/', listCases);
router.get('/:caseId', getCaseById);
router.post('/:caseId/assign', requireRole('ADMIN'), assignDoctor);
router.post('/:caseId/report', requireRole('DOCTOR'), submitReport);

module.exports = router;
