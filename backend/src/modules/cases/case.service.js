const prisma = require('../../config/db');

async function listCases(user) {
  const where =
    user.role === 'ADMIN'
      ? { adminId: user.adminId }
      : { adminId: user.adminId, assignedDoctorId: user.userId };

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
      patientEmail: true,
      patientPhone: true,
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

async function getCaseById(caseId, adminId) {
  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      assignedDoctor: { select: { id: true, name: true, email: true } },
      aiResult: true,
      report: {
        select: {
          id: true,
          reportText: true,
          impression: true,
          submittedAt: true,
          accessToken: true,
        },
      },
    },
  });

  if (!caseRecord) {
    const err = new Error('Case not found.');
    err.status = 404;
    throw err;
  }

  if (caseRecord.adminId !== adminId) {
    const err = new Error('Forbidden.');
    err.status = 403;
    throw err;
  }

  const pacsConfig = await prisma.integration.findUnique({
    where: { adminId_type: { adminId, type: 'PACS' } },
    select: { url: true },
  });
  const pacsBase = pacsConfig?.url || '';

  return {
    ...caseRecord,
    pacsViewerUrl: pacsBase
      ? `${pacsBase}/app/explorer.html#study?uuid=${caseRecord.orthancId}`
      : null,
  };
}

async function assignDoctor(caseId, doctorId, adminId) {
  const existing = await prisma.case.findUnique({ where: { id: caseId } });
  if (!existing) {
    const err = new Error('Case not found.');
    err.status = 404;
    throw err;
  }

  if (existing.adminId !== adminId) {
    const err = new Error('Forbidden.');
    err.status = 403;
    throw err;
  }

  const doctor = await prisma.user.findUnique({ where: { id: doctorId } });
  if (
    !doctor ||
    doctor.role !== 'DOCTOR' ||
    doctor.createdByAdminId !== adminId
  ) {
    const err = new Error(
      'Invalid doctorId. Doctor not found or does not belong to your organization.'
    );
    err.status = 400;
    throw err;
  }

  const updated = await prisma.case.update({
    where: { id: caseId },
    data: { assignedDoctorId: doctorId, status: 'PENDING_REVIEW' },
    include: {
      assignedDoctor: { select: { id: true, name: true, email: true } },
    },
  });

  return updated;
}

async function updateCaseStatus(caseId, status, user) {
  const existing = await prisma.case.findUnique({ where: { id: caseId } });
  if (!existing) {
    const err = new Error('Case not found.');
    err.status = 404;
    throw err;
  }

  // Security check: Only the organization's admin or the assigned doctor can update status
  const isOrgAdmin = user.role === 'ADMIN' && existing.adminId === user.adminId;
  const isAssignedDoctor =
    user.role === 'DOCTOR' && existing.assignedDoctorId === user.userId;

  if (!isOrgAdmin && !isAssignedDoctor) {
    const err = new Error('Forbidden: You do not have permission to update this case.');
    err.status = 403;
    throw err;
  }

  // Basic validation for status transitions
  const validStatuses = ['PENDING_REVIEW', 'IN_REVIEW', 'COMPLETED'];
  if (!validStatuses.includes(status)) {
    const err = new Error(`Invalid status. Use one of: ${validStatuses.join(', ')}`);
    err.status = 400;
    throw err;
  }

  const updated = await prisma.case.update({
    where: { id: caseId },
    data: { status },
  });

  return updated;
}

module.exports = { listCases, getCaseById, assignDoctor, updateCaseStatus };
