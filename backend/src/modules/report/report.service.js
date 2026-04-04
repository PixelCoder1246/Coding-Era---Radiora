const crypto = require('crypto');
const prisma = require('../../config/db');
const { sendReportEmail } = require('../../utils/email');

async function submitReport(caseId, doctorId, { reportText, impression }) {
  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    include: { report: true },
  });

  if (!caseRecord) {
    const err = new Error('Case not found.');
    err.status = 404;
    throw err;
  }

  if (caseRecord.assignedDoctorId !== doctorId) {
    const err = new Error('You are not assigned to this case.');
    err.status = 403;
    throw err;
  }

  if (caseRecord.status === 'COMPLETED') {
    const err = new Error('Report already submitted for this case.');
    err.status = 400;
    throw err;
  }

  const accessToken = crypto.randomBytes(24).toString('hex');

  const report = await prisma.report.create({
    data: {
      caseId,
      doctorId,
      reportText,
      impression: impression || null,
      accessToken,
    },
  });

  await prisma.case.update({
    where: { id: caseId },
    data: { status: 'COMPLETED' },
  });

  if (caseRecord.patientEmail) {
    await sendReportEmail({
      to: caseRecord.patientEmail,
      patientName: caseRecord.patientName,
      accessToken,
    });
  }

  return { reportId: report.id, accessToken };
}

async function resendNotification(caseId, doctorId) {
  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    include: { report: true },
  });

  if (!caseRecord) {
    const err = new Error('Case not found.');
    err.status = 404;
    throw err;
  }

  if (caseRecord.assignedDoctorId !== doctorId) {
    const err = new Error('You are not assigned to this case.');
    err.status = 403;
    throw err;
  }

  if (caseRecord.status !== 'COMPLETED' || !caseRecord.report) {
    const err = new Error('No report submitted yet for this case.');
    err.status = 400;
    throw err;
  }

  const { accessToken } = caseRecord.report;

  if (caseRecord.patientEmail) {
    await sendReportEmail({
      to: caseRecord.patientEmail,
      patientName: caseRecord.patientName,
      accessToken,
    });
  }

  return { message: 'Notification resent successfully.', accessToken };
}

module.exports = { submitReport, resendNotification };
