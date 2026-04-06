const axios = require('axios');
const prisma = require('../config/db');
const { assignDoctorToCase } = require('./assignment.service');
const { isAiEnabled, triggerAiAnalysis } = require('../utils/ai');

const pollingIntervals = new Map();

async function runPollCycle(pacsConfig, hisConfig) {
  const adminId = pacsConfig.adminId;
  console.log(`[POLL] Starting poll cycle for admin ${adminId}...`);

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
    console.error(
      `[POLL] Failed to reach PACS for admin ${adminId}:`,
      err.message
    );
    return;
  }

  if (!Array.isArray(orthancIds) || orthancIds.length === 0) {
    console.log(`[POLL] No studies found in PACS for admin ${adminId}.`);
    return;
  }

  console.log(
    `[POLL] Found ${orthancIds.length} studies for admin ${adminId}.`
  );

  for (const orthancId of orthancIds) {
    try {
      await processStudy(orthancId, pacsConfig, hisConfig, adminId);
    } catch (err) {
      console.error(
        `[POLL] Unexpected error processing study ${orthancId}:`,
        err.message
      );
    }
  }

  console.log(`[POLL] Cycle complete for admin ${adminId}.`);
}

async function processStudy(orthancId, pacsConfig, hisConfig, adminId) {
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
  const studyDate = mainTags.StudyDate || null;
  const patientId = patientTags.PatientID || mainTags.PatientID || null;

  let scanModality = mainTags.ModalitiesInStudy || mainTags.Modality || null;
  let scanBodyPart =
    mainTags.BodyPartExamined || mainTags.StudyDescription || null;

  if (!studyInstanceUID) {
    console.warn(`[POLL] Skipping ${orthancId}: missing StudyInstanceUID`);
    return;
  }
  if (!accessionNumber) {
    console.warn(
      `[POLL] Skipping study ${orthancId}: missing AccessionNumber. Linkage required via upload form.`
    );
    return;
  }

  if (
    (!scanBodyPart || !scanModality) &&
    studyMeta.Series &&
    studyMeta.Series.length > 0
  ) {
    try {
      const firstSeriesId = studyMeta.Series[0];
      const seriesRes = await axios.get(
        `${pacsConfig.url}/series/${firstSeriesId}`,
        {
          ...authOpts,
          timeout: 5000,
        }
      );
      const seriesTags = seriesRes.data.MainDicomTags || {};

      if (!scanModality) scanModality = seriesTags.Modality;

      if (!scanBodyPart) {
        scanBodyPart =
          seriesTags.BodyPartExamined ||
          seriesTags.PerformedProcedureStepDescription ||
          null;
      }
    } catch (err) {
      console.warn(
        `[POLL] Could not fetch series details for ${orthancId}:`,
        err.message
      );
    }
  }

  const lastUpdateStr = studyMeta.LastUpdate;
  if (lastUpdateStr) {
    const year = parseInt(lastUpdateStr.slice(0, 4));
    const month = parseInt(lastUpdateStr.slice(4, 6)) - 1;
    const day = parseInt(lastUpdateStr.slice(6, 8));
    const hour = parseInt(lastUpdateStr.slice(9, 11));
    const min = parseInt(lastUpdateStr.slice(11, 13));
    const sec = parseInt(lastUpdateStr.slice(13, 15));
    const lastUpdateDate = new Date(Date.UTC(year, month, day, hour, min, sec));
    const now = new Date();
    const secondsSinceUpdate =
      (now.getTime() - lastUpdateDate.getTime()) / 1000;

    if (secondsSinceUpdate < 15) {
      console.log(
        `[POLL] Study ${orthancId} is still unstable (updated ${Math.round(secondsSinceUpdate)}s ago). Waiting.`
      );
      return;
    }
  }

  const already = await prisma.processedStudy.findUnique({
    where: { adminId_studyInstanceUID: { adminId, studyInstanceUID } },
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

  const finalModality = scanModality || order.modality || 'UNKNOWN';
  const finalBodyPart = scanBodyPart || order.bodyPart || 'UNKNOWN';

  const hisPatientId = order.patientId || patientId;

  if (!hisPatientId && !patientId) {
    console.warn(`[POLL] Skipping ${orthancId}: missing patientId`);
    return;
  }

  let patientName = 'Unknown';
  let patientEmail = null;
  let patientPhone = null;

  if (hisPatientId) {
    try {
      const patientRes = await axios.get(
        `${hisConfig.url}/patients/${hisPatientId}`,
        { headers: hisHeaders, timeout: 8000 }
      );
      patientName =
        patientRes.data.name || patientRes.data.patientName || 'Unknown';
      patientEmail = patientRes.data.email || null;
      patientPhone = patientRes.data.phone || null;
    } catch (err) {
      console.warn(
        `[POLL] Could not fetch patient ${hisPatientId}:`,
        err.message
      );
    }
  }

  const studyDateParsed = studyDate ? parseStudyDate(studyDate) : null;

  await prisma.processedStudy.create({
    data: { adminId, studyInstanceUID },
  });

  let newCase;
  try {
    newCase = await prisma.case.create({
      data: {
        adminId,
        orthancId,
        studyInstanceUID,
        accessionNumber,
        patientId: hisPatientId || patientId || 'UNKNOWN',
        patientName,
        patientEmail,
        patientPhone,
        modality:
          typeof finalModality === 'string'
            ? finalModality
            : Array.isArray(finalModality)
              ? finalModality.join('/')
              : 'UNKNOWN',
        bodyPart:
          typeof finalBodyPart === 'string'
            ? finalBodyPart
            : Array.isArray(finalBodyPart)
              ? finalBodyPart.join('/')
              : 'UNKNOWN',
        studyDate: studyDateParsed,
        status: 'UNASSIGNED',
        aiStatus: 'NOT_REQUESTED',
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      console.warn(
        `[POLL] studyInstanceUID=${studyInstanceUID} already exists as a case for admin ${adminId}. Skipping.`
      );
      return;
    }
    throw err;
  }

  console.log(
    `[POLL] Case created → UID=${studyInstanceUID}, ACC=${accessionNumber}, Patient=${patientName}, Admin=${adminId}`
  );

  const assignedDoctor = await assignDoctorToCase(adminId);
  if (assignedDoctor) {
    await prisma.case.update({
      where: { id: newCase.id },
      data: { assignedDoctorId: assignedDoctor.id, status: 'PENDING_REVIEW' },
    });
    console.log(
      `[POLL] Case ${newCase.id} auto-assigned to doctor ${assignedDoctor.id}`
    );
  } else {
    console.log(
      `[POLL] No available doctor for case ${newCase.id}. Left UNASSIGNED.`
    );
  }

  if (isAiEnabled()) {
    triggerAiAnalysis(
      newCase.id,
      studyInstanceUID,
      pacsConfig.url,
      pacsConfig.username,
      pacsConfig.password
    );
    console.log(`[POLL] AI analysis triggered for case ${newCase.id}`);
  }
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
  const activePacsIntegrations = await prisma.integration.findMany({
    where: { type: 'PACS', active: true },
  });

  if (activePacsIntegrations.length === 0) {
    console.log(
      '[POLL] No active PACS integrations found. Polling not started.'
    );
    return;
  }

  for (const pacsConfig of activePacsIntegrations) {
    const adminId = pacsConfig.adminId;

    if (pollingIntervals.has(adminId)) {
      console.log(`[POLL] Already polling for admin ${adminId}. Skipping.`);
      continue;
    }

    const hisConfig = await prisma.integration.findUnique({
      where: { adminId_type: { adminId, type: 'HIS' } },
    });

    if (!hisConfig || !hisConfig.active) {
      console.log(`[POLL] HIS not active for admin ${adminId}. Skipping.`);
      continue;
    }

    const intervalSeconds = Math.max(pacsConfig.pollIntervalSeconds || 30, 10);
    const intervalMs = intervalSeconds * 1000;
    console.log(
      `[POLL] Starting polling for admin ${adminId} every ${intervalSeconds}s`
    );

    try {
      runPollCycle(pacsConfig, hisConfig).catch((err) =>
        console.error(
          `[POLL] Initial cycle failed for admin ${adminId}:`,
          err.message
        )
      );
    } catch (err) {
      console.error(
        `[POLL] Failed to trigger initial cycle for admin ${adminId}:`,
        err.message
      );
    }

    const interval = setInterval(() => {
      runPollCycle(pacsConfig, hisConfig).catch((err) =>
        console.error(`[POLL] Cycle failed for admin ${adminId}:`, err.message)
      );
    }, intervalMs);

    pollingIntervals.set(adminId, interval);
  }
}

function stopPolling() {
  for (const [adminId, interval] of pollingIntervals.entries()) {
    clearInterval(interval);
    console.log(`[POLL] Polling stopped for admin ${adminId}.`);
  }
  pollingIntervals.clear();
}

module.exports = { startPolling, stopPolling };
