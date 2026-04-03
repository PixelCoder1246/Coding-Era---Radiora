const { Router } = require('express');
const multer = require('multer');
const { uploadDicom } = require('./pacs.controller');

const upload = multer({ dest: 'uploads/' });
const router = Router();

// Open endpoint — no auth required (demo/simulator use)
router.post('/upload', upload.single('file'), uploadDicom);

module.exports = router;
