const prisma = require('../../config/db');

async function listCases(user) {
  const where = user.role === 'ADMIN' ? {} : { assignedDoctorId: user.id };

  const cases = await prisma.case.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orthancId: true,
      studyInstanceUID: true,
      accessionNumber: true,
      patientId: true,
      patientName: true,
      modality: true,
      bodyPart: true,
      studyDate: true,
      status: true,
      aiStatus: true,
      assignedDoctorId: true,
      assignedDoctor: { select: { id: true, name: true, email: true } },
      createdAt: true,
      updatedAt: true,
    },
  });

  return cases;
}

async function getCaseById(caseId) {
  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      assignedDoctor: { select: { id: true, name: true, email: true } },
    },
  });

  if (!caseRecord) {
    const err = new Error('Case not found.');
    err.status = 404;
    throw err;
  }

  const pacsConfig = await prisma.integration.findUnique({
    where: { type: 'PACS' },
    select: { url: true },
  });
  const pacsBase = pacsConfig?.url || '';

  return {
    ...caseRecord,
    pacsViewerUrl: pacsBase
      ? `${pacsBase}/app/explorer.html#study?uuid=${caseRecord.orthancId}`
      : null,
    aiResult: null,
    report: null,
  };
}

async function assignDoctor(caseId, doctorId) {
  const existing = await prisma.case.findUnique({ where: { id: caseId } });
  if (!existing) {
    const err = new Error('Case not found.');
    err.status = 404;
    throw err;
  }

  const doctor = await prisma.user.findUnique({ where: { id: doctorId } });
  if (!doctor || doctor.role !== 'DOCTOR') {
    const err = new Error('Invalid doctorId. User not found or not a DOCTOR.');
    err.status = 400;
    throw err;
  }

  const updated = await prisma.case.update({
    where: { id: caseId },
    data: {
      assignedDoctorId: doctorId,
      status: 'PENDING_REVIEW',
    },
    include: {
      assignedDoctor: { select: { id: true, name: true, email: true } },
    },
  });

  return updated;
}

module.exports = { listCases, getCaseById, assignDoctor };
