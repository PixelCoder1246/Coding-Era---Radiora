const { Router } = require('express');
const {
  authMiddleware,
  requireRole,
} = require('../../middleware/auth.middleware');
const { listCases, getCaseById, assignDoctor } = require('./case.controller');

const router = Router();

// All case routes require auth
router.use(authMiddleware);

// GET /api/cases — ADMIN: all, DOCTOR: only assigned
router.get('/', listCases);

// GET /api/cases/:caseId — single case with viewer URL
router.get('/:caseId', getCaseById);

// POST /api/cases/:caseId/assign — ADMIN only
router.post('/:caseId/assign', requireRole('ADMIN'), assignDoctor);

module.exports = router;
