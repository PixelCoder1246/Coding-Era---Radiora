const { Router } = require('express');
const multer = require('multer');
const { authMiddleware, requireRole } = require('../../middleware/auth.middleware');
const { uploadDicom, listStudies, deleteStudy } = require('./pacs.controller');

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.use(authMiddleware);

router.post('/upload', upload.single('file'), uploadDicom);

// Admin-only: view and manage raw Orthanc studies
router.get('/studies', requireRole('ADMIN'), listStudies);
router.delete('/studies/:orthancId', requireRole('ADMIN'), deleteStudy);

module.exports = router;
