const prisma = require('../../config/db');

async function getReportByToken(token) {
  const report = await prisma.report.findUnique({
    where: { accessToken: token },
    include: {
      case: { select: { patientName: true } },
      doctor: { select: { name: true } },
    },
  });

  if (!report) {
    const err = new Error('Report not found or token invalid.');
    err.status = 404;
    throw err;
  }

  return {
    patientName: report.case.patientName,
    reportText: report.reportText,
    impression: report.impression,
    doctorName: report.doctor.name,
    submittedAt: report.submittedAt,
  };
}

module.exports = { getReportByToken };
