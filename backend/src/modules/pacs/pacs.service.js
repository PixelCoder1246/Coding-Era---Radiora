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

async function listStudies(adminId) {
  const config = await prisma.integration.findUnique({
    where: { adminId_type: { adminId, type: 'PACS' } },
  });

  if (!config || !config.active) {
    const err = new Error('PACS not active. Activate PACS integration first.');
    err.status = 503;
    throw err;
  }

  const authOpts =
    config.username && config.password
      ? { auth: { username: config.username, password: config.password } }
      : {};

  const response = await axios.get(`${config.url}/studies`, {
    ...authOpts,
    timeout: 10000,
  });

  const orthancIds = Array.isArray(response.data) ? response.data : [];

  // Fetch metadata for each study and check if a case exists in our DB
  const studies = await Promise.all(
    orthancIds.map(async (orthancId) => {
      try {
        const res = await axios.get(`${config.url}/studies/${orthancId}`, {
          ...authOpts,
          timeout: 5000,
        });
        const meta = res.data;
        const mainTags = meta.MainDicomTags || {};
        const patientTags = meta.PatientMainDicomTags || {};

        const studyInstanceUID = mainTags.StudyInstanceUID || null;

        // Check if this study has a case in our DB
        const caseRecord = studyInstanceUID
          ? await prisma.case.findFirst({
              where: { adminId, studyInstanceUID },
              select: {
                id: true,
                status: true,
                patientName: true,
                assignedDoctor: { select: { name: true } },
              },
            })
          : null;

        return {
          orthancId,
          studyInstanceUID,
          accessionNumber: mainTags.AccessionNumber || null,
          patientId: patientTags.PatientID || mainTags.PatientID || null,
          patientName: patientTags.PatientName || mainTags.PatientName || null,
          modality: mainTags.ModalitiesInStudy || mainTags.Modality || null,
          studyDate: mainTags.StudyDate || null,
          lastUpdate: meta.LastUpdate || null,
          seriesCount: (meta.Series || []).length,
          hasCase: !!caseRecord,
          caseId: caseRecord?.id || null,
          caseStatus: caseRecord?.status || null,
          casePatientName: caseRecord?.patientName || null,
          caseDoctorName: caseRecord?.assignedDoctor?.name || null,
        };
      } catch (err) {
        return { orthancId, error: err.message };
      }
    })
  );

  return studies;
}

async function deleteStudy(orthancId, adminId) {
  const config = await prisma.integration.findUnique({
    where: { adminId_type: { adminId, type: 'PACS' } },
  });

  if (!config || !config.active) {
    const err = new Error('PACS not active. Activate PACS integration first.');
    err.status = 503;
    throw err;
  }

  const authOpts =
    config.username && config.password
      ? { auth: { username: config.username, password: config.password } }
      : {};

  // Get studyInstanceUID before deleting so we can clean up DB
  let studyInstanceUID = null;
  try {
    const res = await axios.get(`${config.url}/studies/${orthancId}`, {
      ...authOpts,
      timeout: 5000,
    });
    studyInstanceUID = res.data?.MainDicomTags?.StudyInstanceUID || null;
  } catch {
    // Study might already be gone — still try to clean up DB
  }

  // Delete from Orthanc
  try {
    await axios.delete(`${config.url}/studies/${orthancId}`, {
      ...authOpts,
      timeout: 10000,
    });
  } catch (err) {
    const error = new Error(`Failed to delete from Orthanc: ${err.message}`);
    error.status = 502;
    throw error;
  }

  // Clean up DB so polling can re-capture this study
  if (studyInstanceUID) {
    const caseRecord = await prisma.case.findFirst({
      where: { adminId, studyInstanceUID },
    });
    if (caseRecord) {
      await prisma.aiResult.deleteMany({ where: { caseId: caseRecord.id } });
      await prisma.report.deleteMany({ where: { caseId: caseRecord.id } });
      await prisma.case.delete({ where: { id: caseRecord.id } });
    }
    await prisma.processedStudy.deleteMany({
      where: { adminId, studyInstanceUID },
    });
  }

  return {
    message:
      'Study deleted from Orthanc. Database records cleared — polling will re-capture on next cycle.',
  };
}

module.exports = { uploadDicom, listStudies, deleteStudy };
