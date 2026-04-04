const crypto = require('crypto');
const bcrypt = require('bcrypt');
const prisma = require('../../config/db');

const SALT_ROUNDS = 12;

async function createDoctor({ name, email, maxConcurrentCases, adminId }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email already registered.');
    err.status = 409;
    throw err;
  }

  const generatedPassword = crypto.randomBytes(6).toString('hex');
  const passwordHash = await bcrypt.hash(generatedPassword, SALT_ROUNDS);

  const doctor = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'DOCTOR',
      maxConcurrentCases: maxConcurrentCases ?? 5,
      createdByAdminId: adminId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      maxConcurrentCases: true,
      createdByAdminId: true,
      createdAt: true,
    },
  });

  return { ...doctor, generatedPassword };
}

async function listDoctors(adminId) {
  return prisma.user.findMany({
    where: { role: 'DOCTOR', createdByAdminId: adminId },
    select: {
      id: true,
      name: true,
      email: true,
      maxConcurrentCases: true,
      createdAt: true,
    },
  });
}

async function deleteDoctor(doctorId, adminId) {
  const doctor = await prisma.user.findUnique({ where: { id: doctorId } });
  if (
    !doctor ||
    doctor.role !== 'DOCTOR' ||
    doctor.createdByAdminId !== adminId
  ) {
    const err = new Error(
      'Doctor not found or does not belong to your organization.'
    );
    err.status = 404;
    throw err;
  }

  // Block deletion if the doctor has submitted reports — medical records must be preserved
  const reportCount = await prisma.report.count({ where: { doctorId } });
  if (reportCount > 0) {
    const err = new Error(
      'Cannot remove a doctor who has submitted reports. Medical records must be preserved.'
    );
    err.status = 409;
    throw err;
  }

  // Unassign any active (non-completed) cases so they go back to the queue
  await prisma.case.updateMany({
    where: {
      assignedDoctorId: doctorId,
      status: { not: 'COMPLETED' },
    },
    data: { assignedDoctorId: null, status: 'UNASSIGNED' },
  });

  await prisma.user.delete({ where: { id: doctorId } });
  return { message: 'Doctor removed successfully.' };
}

async function resetDoctorPassword(doctorId, adminId) {
  const doctor = await prisma.user.findUnique({ where: { id: doctorId } });
  if (
    !doctor ||
    doctor.role !== 'DOCTOR' ||
    doctor.createdByAdminId !== adminId
  ) {
    const err = new Error(
      'Doctor not found or does not belong to your organization.'
    );
    err.status = 404;
    throw err;
  }

  const generatedPassword = crypto.randomBytes(6).toString('hex');
  const passwordHash = await bcrypt.hash(generatedPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: doctorId },
    data: { passwordHash },
  });

  return { generatedPassword };
}

module.exports = {
  createDoctor,
  listDoctors,
  deleteDoctor,
  resetDoctorPassword,
};
