const axios = require('axios');
const prisma = require('../../config/db');

async function getHisConfig() {
  const config = await prisma.integration.findUnique({
    where: { type: 'HIS' },
  });
  if (!config || !config.active) {
    const err = new Error('HIS not active. Activate HIS integration first.');
    err.status = 503;
    throw err;
  }
  return config;
}

async function createPatient({ patientId, name, dob, gender }) {
  const config = await getHisConfig();
  const headers = config.apiKey ? { 'x-api-key': config.apiKey } : {};

  const resolvedPatientId =
    patientId ||
    `P-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  const response = await axios.post(
    `${config.url}/patients`,
    { patientId: resolvedPatientId, name, dob, gender },
    { headers, timeout: 8000 }
  );

  return response.data;
}

async function createOrder({ accessionNumber, patientId, modality, bodyPart }) {
  const config = await getHisConfig();
  const headers = config.apiKey ? { 'x-api-key': config.apiKey } : {};

  const resolvedAccessionNumber =
    accessionNumber ||
    `ACC-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const response = await axios.post(
    `${config.url}/orders`,
    { accessionNumber: resolvedAccessionNumber, patientId, modality, bodyPart },
    { headers, timeout: 8000 }
  );

  return response.data;
}

module.exports = { createPatient, createOrder };
