const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const prisma = require('../../config/db');
const { modifyDicomAccession } = require('../../utils/dicom.utils');

async function uploadDicom(file, adminId, accessionNumber) {
  const config = await prisma.integration.findUnique({
    where: { adminId_type: { adminId, type: 'PACS' } },
  });

  if (!config || !config.active) {
    const err = new Error('PACS not active. Activate PACS integration first.');
    err.status = 503;
    throw err;
  }

  let uploadPath = file.path;
  const modifiedPath = file.path + '.mod';

  if (accessionNumber) {
    try {
      await modifyDicomAccession(file.path, modifiedPath, accessionNumber);
      uploadPath = modifiedPath;
    } catch (err) {
      console.error('[PACS_SERVICE] Failed to modify DICOM:', err);
      // Fallback: upload original if modification fails, or throw error?
      // For now, let's proceed with original but log the error
    }
  }

  const form = new FormData();
  form.append('file', fs.createReadStream(uploadPath), {
    filename: file.originalname,
    contentType: file.mimetype || 'application/octet-stream',
  });

  const authOpts =
    config.username && config.password
      ? { auth: { username: config.username, password: config.password } }
      : {};

  const response = await axios.post(`${config.url}/instances`, form, {
    ...authOpts,
    headers: form.getHeaders(),
    timeout: 30000,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  fs.unlink(file.path, () => {});
  if (fs.existsSync(modifiedPath)) {
    fs.unlink(modifiedPath, () => {});
  }

  return response.data;
}

module.exports = { uploadDicom };
