const prisma = require('../../config/db');

async function getReportByToken(token) {
  const report = await prisma.report.findUnique({
    where: { accessToken: token },
    include: {
      case: {
        select: {
          patientName: true,
          orthancId: true,
          adminId: true,
          modality: true,
          bodyPart: true,
          studyDate: true,
          studyInstanceUID: true,
        },
      },
      doctor: { select: { name: true } },
    },
  });

  if (!report) {
    const err = new Error('Report not found or token invalid.');
    err.status = 404;
    throw err;
  }

  const pacsConfig = await prisma.integration.findUnique({
    where: {
      adminId_type: { adminId: report.case.adminId, type: 'PACS' },
    },
    select: { url: true },
  });

  return {
    patientName: report.case.patientName,
    modality: report.case.modality,
    bodyPart: report.case.bodyPart,
    studyDate: report.case.studyDate,
    studyInstanceUID: report.case.studyInstanceUID,
    orthancId: report.case.orthancId,
    orthancBaseUrl: pacsConfig?.url || null,
    reportText: report.reportText,
    impression: report.impression,
    doctorName: report.doctor.name,
    submittedAt: report.submittedAt,
  };
}

module.exports = { getReportByToken };
