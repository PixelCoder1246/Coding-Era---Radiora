const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const prisma = require('../../config/db');

async function uploadDicom(file, adminId) {
  const config = await prisma.integration.findUnique({
    where: { adminId_type: { adminId, type: 'PACS' } },
  });

  if (!config || !config.active) {
    const err = new Error('PACS not active. Activate PACS integration first.');
    err.status = 503;
    throw err;
  }

  const form = new FormData();
  form.append('file', fs.createReadStream(file.path), {
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

  return response.data;
}

module.exports = { uploadDicom };
