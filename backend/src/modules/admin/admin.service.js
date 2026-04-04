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

module.exports = { createDoctor, listDoctors };
