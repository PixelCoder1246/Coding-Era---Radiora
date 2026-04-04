const { Router } = require('express');
const multer = require('multer');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { uploadDicom } = require('./pacs.controller');

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.use(authMiddleware);

router.post('/upload', upload.single('file'), uploadDicom);

module.exports = router;
