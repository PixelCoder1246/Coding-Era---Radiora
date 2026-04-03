const bcrypt = require('bcrypt');
const prisma = require('../../config/db');
const { signToken } = require('../../utils/jwt');

const SALT_ROUNDS = 12;

async function register({ name, email, password, role }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email already registered.');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: role || 'DOCTOR' },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return user;
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('Invalid email or password.');
    err.status = 401;
    throw err;
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    const err = new Error('Invalid email or password.');
    err.status = 401;
    throw err;
  }

  const token = signToken({ userId: user.id, role: user.role });

  return {
    token,
    user: { id: user.id, name: user.name, role: user.role },
  };
}

module.exports = { register, login };
