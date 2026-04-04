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

  if (caseRecord.patientPhone) {
    console.log(
      `[WHATSAPP] SENT TO ${caseRecord.patientPhone} → /portal/report/${accessToken}`
    );
  }

  return { reportId: report.id, accessToken };
}

module.exports = { submitReport };
