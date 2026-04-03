const axios = require('axios');
const prisma = require('../../config/db');

// Saves or overwrites PACS integration config
async function savePacsConfig({ url, username, password, pollIntervalSeconds }) {
  const integration = await prisma.integration.upsert({
    where: { type: 'PACS' },
    update: { url, username, password, pollIntervalSeconds: pollIntervalSeconds ?? 30, active: false, activatedAt: null },
    create: { type: 'PACS', url, username, password, pollIntervalSeconds: pollIntervalSeconds ?? 30 },
  });
  return integration;
}

// Saves or overwrites HIS integration config
async function saveHisConfig({ url, apiKey }) {
  const integration = await prisma.integration.upsert({
    where: { type: 'HIS' },
    update: { url, apiKey, active: false, activatedAt: null },
    create: { type: 'HIS', url, apiKey },
  });
  return integration;
}

// Returns current active status of both integrations
async function getStatus() {
  const [pacs, his] = await Promise.all([
    prisma.integration.findUnique({ where: { type: 'PACS' }, select: { active: true, url: true, activatedAt: true } }),
    prisma.integration.findUnique({ where: { type: 'HIS' }, select: { active: true, url: true, activatedAt: true } }),
  ]);

  return {
    pacs: pacs ? { active: pacs.active, url: pacs.url, activatedAt: pacs.activatedAt } : { active: false },
    his: his ? { active: his.active, url: his.url, activatedAt: his.activatedAt } : { active: false },
  };
}

// Activates PACS integration — verifies Orthanc is reachable via GET /studies
async function activatePacs() {
  const config = await prisma.integration.findUnique({ where: { type: 'PACS' } });

  if (!config) {
    const err = new Error('PACS integration is not configured. Save config first.');
    err.status = 400;
    throw err;
  }

  // Verify Orthanc is reachable
  try {
    const authHeader = config.username && config.password
      ? {
        auth: { username: config.username, password: config.password },
      }
      : {};

    await axios.get(`${config.url}/studies`, {
      ...authHeader,
      timeout: 5000,
      params: { limit: 1 },
    });
  } catch {
    const err = new Error('Cannot reach PACS (Orthanc). Verify the URL and credentials.');
    err.status = 502;
    throw err;
  }

  const updated = await prisma.integration.update({
    where: { type: 'PACS' },
    data: { active: true, activatedAt: new Date() },
    select: { active: true, activatedAt: true, url: true },
  });

  return updated;
}

// Activates HIS integration — verifies HIS is reachable via GET /health or /patients
async function activateHis() {
  const config = await prisma.integration.findUnique({ where: { type: 'HIS' } });

  if (!config) {
    const err = new Error('HIS integration is not configured. Save config first.');
    err.status = 400;
    throw err;
  }

  // Verify HIS is reachable — try /health, fall back to /patients
  try {
    const headers = config.apiKey ? { 'x-api-key': config.apiKey } : {};

    await axios.get(`${config.url}/health`, {
      headers,
      timeout: 5000,
    }).catch(() =>
      axios.get(`${config.url}/patients`, { headers, timeout: 5000 })
    );
  } catch {
    const err = new Error('Cannot reach HIS service. Verify the URL and API key.');
    err.status = 502;
    throw err;
  }

  const updated = await prisma.integration.update({
    where: { type: 'HIS' },
    data: { active: true, activatedAt: new Date() },
    select: { active: true, activatedAt: true, url: true },
  });

  return updated;
}

module.exports = { savePacsConfig, saveHisConfig, getStatus, activatePacs, activateHis };
