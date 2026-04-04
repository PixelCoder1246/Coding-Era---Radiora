const axios = require('axios');
const prisma = require('../../config/db');

async function savePacsConfig(
  adminId,
  { url, username, password, pollIntervalSeconds }
) {
  const integration = await prisma.integration.upsert({
    where: { adminId_type: { adminId, type: 'PACS' } },
    update: {
      url,
      username,
      password,
      pollIntervalSeconds: pollIntervalSeconds ?? 30,
      active: false,
      activatedAt: null,
    },
    create: {
      adminId,
      type: 'PACS',
      url,
      username,
      password,
      pollIntervalSeconds: pollIntervalSeconds ?? 30,
    },
  });
  return integration;
}

async function saveHisConfig(adminId, { url, apiKey }) {
  const integration = await prisma.integration.upsert({
    where: { adminId_type: { adminId, type: 'HIS' } },
    update: { url, apiKey, active: false, activatedAt: null },
    create: { adminId, type: 'HIS', url, apiKey },
  });
  return integration;
}

async function getStatus(adminId) {
  const [pacs, his] = await Promise.all([
    prisma.integration.findUnique({
      where: { adminId_type: { adminId, type: 'PACS' } },
      select: { active: true, url: true, activatedAt: true },
    }),
    prisma.integration.findUnique({
      where: { adminId_type: { adminId, type: 'HIS' } },
      select: { active: true, url: true, activatedAt: true },
    }),
  ]);

  return {
    pacs: pacs
      ? { active: pacs.active, url: pacs.url, activatedAt: pacs.activatedAt }
      : { active: false },
    his: his
      ? { active: his.active, url: his.url, activatedAt: his.activatedAt }
      : { active: false },
  };
}

async function getPacsConfig(adminId) {
  const config = await prisma.integration.findUnique({
    where: { adminId_type: { adminId, type: 'PACS' } },
    select: {
      url: true,
      username: true,
      password: true,
      pollIntervalSeconds: true,
      active: true,
      activatedAt: true,
    },
  });
  return config || null;
}

async function getHisConfig(adminId) {
  const config = await prisma.integration.findUnique({
    where: { adminId_type: { adminId, type: 'HIS' } },
    select: {
      url: true,
      apiKey: true,
      active: true,
      activatedAt: true,
    },
  });
  return config || null;
}

async function activatePacs(adminId) {
  const config = await prisma.integration.findUnique({
    where: { adminId_type: { adminId, type: 'PACS' } },
  });

  if (!config) {
    const err = new Error(
      'PACS integration is not configured. Save config first.'
    );
    err.status = 400;
    throw err;
  }

  try {
    await axios.get(`${config.url}/studies`, {
      auth: {
        username: config.username || '',
        password: config.password || '',
      },
      timeout: 5000,
    });
  } catch {
    const err = new Error(
      'Cannot reach PACS (Orthanc). Verify the URL and credentials.'
    );
    err.status = 502;
    throw err;
  }

  const updated = await prisma.integration.update({
    where: { adminId_type: { adminId, type: 'PACS' } },
    data: { active: true, activatedAt: new Date() },
    select: { active: true, activatedAt: true, url: true },
  });

  return updated;
}

async function activateHis(adminId) {
  const config = await prisma.integration.findUnique({
    where: { adminId_type: { adminId, type: 'HIS' } },
  });

  if (!config) {
    const err = new Error(
      'HIS integration is not configured. Save config first.'
    );
    err.status = 400;
    throw err;
  }

  try {
    const headers = config.apiKey ? { 'x-api-key': config.apiKey } : {};
    await axios
      .get(`${config.url}/health`, { headers, timeout: 5000 })
      .catch(() =>
        axios.get(`${config.url}/patients`, { headers, timeout: 5000 })
      );
  } catch {
    const err = new Error(
      'Cannot reach HIS service. Verify the URL and API key.'
    );
    err.status = 502;
    throw err;
  }

  const updated = await prisma.integration.update({
    where: { adminId_type: { adminId, type: 'HIS' } },
    data: { active: true, activatedAt: new Date() },
    select: { active: true, activatedAt: true, url: true },
  });

  return updated;
}

module.exports = {
  savePacsConfig,
  saveHisConfig,
  getStatus,
  getPacsConfig,
  getHisConfig,
  activatePacs,
  activateHis,
};
