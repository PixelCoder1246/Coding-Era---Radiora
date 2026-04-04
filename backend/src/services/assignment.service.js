const prisma = require('../config/db');

async function assignDoctorToCase(adminId) {
  const doctors = await prisma.user.findMany({
    where: { role: 'DOCTOR', createdByAdminId: adminId },
    select: { id: true, maxConcurrentCases: true },
  });

  const doctorLoads = await Promise.all(
    doctors.map(async (doctor) => {
      const activeCases = await prisma.case.count({
        where: {
          assignedDoctorId: doctor.id,
          status: { in: ['UNASSIGNED', 'PENDING_REVIEW', 'IN_REVIEW'] },
        },
      });
      return { ...doctor, activeCases };
    })
  );

  const eligible = doctorLoads
    .filter((d) => d.activeCases < d.maxConcurrentCases)
    .sort((a, b) => a.activeCases - b.activeCases);

  return eligible[0] || null;
}

module.exports = { assignDoctorToCase };
