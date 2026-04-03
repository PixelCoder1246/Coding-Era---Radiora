const axios = require('axios');
const prisma = require('../config/db');

let pollingInterval = null;

async function runPollCycle(pacsConfig, hisConfig) {
  console.log('[POLL] Starting poll cycle...');

  let orthancIds;
  try {
    const authOpts =
      pacsConfig.username && pacsConfig.password
        ? {
            auth: {
              username: pacsConfig.username,
              password: pacsConfig.password,
            },
          }
        : {};

    const response = await axios.get(`${pacsConfig.url}/studies`, {
      ...authOpts,
      timeout: 10000,
    });
    orthancIds = response.data.slice(0, 50);
  } catch (err) {
    console.error('[POLL] Failed to reach PACS:', err.message);
    return;
  }

  if (!Array.isArray(orthancIds) || orthancIds.length === 0) {
    console.log('[POLL] No studies found in PACS.');
    return;
  }

  console.log(`[POLL] Found ${orthancIds.length} studies in PACS.`);

  for (const orthancId of orthancIds) {
    try {
      await processStudy(orthancId, pacsConfig, hisConfig);
    } catch (err) {
      console.error(
        `[POLL] Unexpected error processing study ${orthancId}:`,
        err.message
      );
    }
  }

  console.log('[POLL] Cycle complete.');
}

async function processStudy(orthancId, pacsConfig, hisConfig) {
  const authOpts =
    pacsConfig.username && pacsConfig.password
      ? {
          auth: {
            username: pacsConfig.username,
            password: pacsConfig.password,
          },
        }
      : {};

  let studyMeta;
  try {
    const res = await axios.get(`${pacsConfig.url}/studies/${orthancId}`, {
      ...authOpts,
      timeout: 8000,
    });
    studyMeta = res.data;
  } catch (err) {
    console.warn(
      `[POLL] Could not fetch metadata for ${orthancId}:`,
      err.message
    );
    return;
  }

  const mainTags = studyMeta.MainDicomTags || {};
  const patientTags = studyMeta.PatientMainDicomTags || {};

  const studyInstanceUID = mainTags.StudyInstanceUID || null;
  const accessionNumber = mainTags.AccessionNumber || null;
  const modality = mainTags.ModalitiesInStudy || mainTags.Modality || null;
  const studyDate = mainTags.StudyDate || null;
  const bodyPart = mainTags.BodyPartExamined || null;
  const patientId = patientTags.PatientID || mainTags.PatientID || null;

  if (!studyInstanceUID) {
    console.warn(`[POLL] Skipping ${orthancId}: missing StudyInstanceUID`);
    return;
  }
  if (!accessionNumber) {
    console.warn(`[POLL] Skipping ${orthancId}: missing AccessionNumber`);
    return;
  }

  const already = await prisma.processedStudy.findUnique({
    where: { studyInstanceUID },
  });
  if (already) return;

  const hisHeaders = hisConfig.apiKey ? { 'x-api-key': hisConfig.apiKey } : {};
  let order;
  try {
    const orderRes = await axios.get(`${hisConfig.url}/orders`, {
      headers: hisHeaders,
      params: { accessionNumber },
      timeout: 8000,
    });
    const data = orderRes.data;
    order = Array.isArray(data) ? data[0] : data;
  } catch (err) {
    console.warn(
      `[POLL] HIS lookup failed for ${accessionNumber}:`,
      err.message
    );
    return;
  }

  if (!order) {
    console.warn(
      `[POLL] No HIS order for accessionNumber=${accessionNumber}. Will retry.`
    );
    return;
  }

  const hisPatientId = order.patientId || patientId;

  if (!hisPatientId && !patientId) {
    console.warn(`[POLL] Skipping ${orthancId}: missing patientId`);
    return;
  }

  let patientName = 'Unknown';
  if (hisPatientId) {
    try {
      const patientRes = await axios.get(
        `${hisConfig.url}/patients/${hisPatientId}`,
        {
          headers: hisHeaders,
          timeout: 8000,
        }
      );
      patientName =
        patientRes.data.name || patientRes.data.patientName || 'Unknown';
    } catch (err) {
      console.warn(
        `[POLL] Could not fetch patient ${hisPatientId}:`,
        err.message
      );
    }
  }

  const studyDateParsed = studyDate ? parseStudyDate(studyDate) : null;

  await prisma.case.create({
    data: {
      orthancId,
      studyInstanceUID,
      accessionNumber,
      patientId: hisPatientId || patientId || 'UNKNOWN',
      patientName,
      modality:
        typeof modality === 'string'
          ? modality
          : Array.isArray(modality)
            ? modality.join('/')
            : 'UNKNOWN',
      bodyPart: bodyPart || null,
      studyDate: studyDateParsed,
      status: 'UNASSIGNED',
      aiStatus: 'NOT_REQUESTED',
    },
  });

  await prisma.processedStudy.create({
    data: { studyInstanceUID },
  });

  console.log(
    `[POLL] Case created → UID=${studyInstanceUID}, ACC=${accessionNumber}, Patient=${patientName}`
  );
}

function parseStudyDate(dateStr) {
  if (!dateStr || dateStr.length !== 8) return null;
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  const d = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  return isNaN(d.getTime()) ? null : d;
}

async function startPolling() {
  if (pollingInterval) {
    console.log('[POLL] Polling already running. Skipping start.');
    return;
  }

  const [pacsConfig, hisConfig] = await Promise.all([
    prisma.integration.findUnique({ where: { type: 'PACS' } }),
    prisma.integration.findUnique({ where: { type: 'HIS' } }),
  ]);

  if (!pacsConfig || !pacsConfig.active) {
    console.log('[POLL] PACS integration not active. Polling not started.');
    return;
  }

  if (!hisConfig || !hisConfig.active) {
    console.log('[POLL] HIS integration not active. Polling not started.');
    return;
  }

  const intervalSeconds = Math.max(pacsConfig.pollIntervalSeconds || 30, 10);
  const intervalMs = intervalSeconds * 1000;
  console.log(`[POLL] Starting polling every ${intervalSeconds}s`);

  runPollCycle(pacsConfig, hisConfig);

  pollingInterval = setInterval(() => {
    runPollCycle(pacsConfig, hisConfig);
  }, intervalMs);
}

function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    console.log('[POLL] Polling stopped.');
  }
}

module.exports = { startPolling, stopPolling };
