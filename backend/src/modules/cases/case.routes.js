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
  updateCaseStatus,
} = require('./case.controller');
const { submitReport, resendNotification } = require('../report/report.controller');

const router = Router();

router.post('/:caseId/ai-result', receiveAiResult);

router.use(authMiddleware);

router.get('/', listCases);
router.get('/:caseId', getCaseById);
router.patch('/:caseId/status', updateCaseStatus);
router.post('/:caseId/assign', requireRole('ADMIN'), assignDoctor);
router.post('/:caseId/report', requireRole('DOCTOR'), submitReport);
router.post('/:caseId/resend-notification', requireRole('DOCTOR'), resendNotification);

module.exports = router;
