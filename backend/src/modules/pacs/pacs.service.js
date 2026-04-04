const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const prisma = require('../../config/db');
const path = require('path');
const AdmZip = require('adm-zip');
const {
  modifyDicomAccession,
  isDicomFile,
} = require('../../utils/dicom.utils');

async function uploadDicom(file, adminId, accessionNumber) {
  const config = await prisma.integration.findUnique({
    where: { adminId_type: { adminId, type: 'PACS' } },
  });

  if (!config || !config.active) {
    const err = new Error('PACS not active. Activate PACS integration first.');
    err.status = 503;
    throw err;
  }

  const isArchive =
    file.mimetype === 'application/zip' ||
    file.originalname.toLowerCase().endsWith('.zip');

  if (isArchive) {
    return await processArchiveAndUpload(file, config, accessionNumber);
  } else {
    return await processSingleFileAndUpload(file, config, accessionNumber);
  }
}

async function processSingleFileAndUpload(file, config, accessionNumber) {
  let uploadPath = file.path;
  const modifiedPath = file.path + '.mod';

  if (accessionNumber) {
    try {
      await modifyDicomAccession(file.path, modifiedPath, accessionNumber);
      uploadPath = modifiedPath;
    } catch (err) {
      console.warn('[PACS_SERVICE] Failed to modify single DICOM:', err);
    }
  }

  const result = await postToOrthanc(uploadPath, file.originalname, config);

  // Cleanup
  fs.unlink(file.path, () => {});
  if (fs.existsSync(modifiedPath)) fs.unlink(modifiedPath, () => {});

  return { type: 'single', result };
}

async function processArchiveAndUpload(zipFile, config, accessionNumber) {
  const zip = new AdmZip(zipFile.path);
  const tempDir = path.join('uploads', `tmp_${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    zip.extractAllTo(tempDir, true);

    const files = [];
    const getAllFiles = (dirPath) => {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          getAllFiles(fullPath);
        } else {
          files.push(fullPath);
        }
      }
    };

    getAllFiles(tempDir);

    let uploadCount = 0;
    for (const filePath of files) {
      if (isDicomFile(filePath)) {
        if (accessionNumber) {
          try {
            await modifyDicomAccession(filePath, filePath, accessionNumber);
          } catch (err) {
            console.warn(
              `[PACS_SERVICE] Failed to modify ZIP slice ${filePath}:`,
              err
            );
          }
        }

        await postToOrthanc(filePath, path.basename(filePath), config);
        uploadCount++;
      }
    }

    return { type: 'archive', totalSlices: uploadCount };
  } finally {
    // Thorough cleanup
    fs.unlink(zipFile.path, () => {});
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

async function postToOrthanc(filePath, originalName, config) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath), {
    filename: originalName,
    contentType: 'application/octet-stream',
  });

  const authOpts =
    config.username && config.password
      ? { auth: { username: config.username, password: config.password } }
      : {};

  const response = await axios.post(`${config.url}/instances`, form, {
    ...authOpts,
    headers: form.getHeaders(),
    timeout: 60000,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  return response.data;
}

module.exports = { uploadDicom };
