const authService = require('./auth.service');
const prisma = require('../../config/db');

async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: 'name, email, and password are required.' });
    }

    const user = await authService.register({ name, email, password, role });
    return res.status(201).json(user);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'email and password are required.' });
    }

    const result = await authService.login({ email, password });

    // sameSite:'none' REQUIRES secure:true — browsers silently reject without it.
    // Since we're always deployed over HTTPS in both local (proxy) and prod, force it.
    const isSecure =
      process.env.NODE_ENV === 'production' ||
      process.env.SECURE_COOKIES === 'true' ||
      process.env.NODE_ENV !== 'test'; // default true unless in test
    res.cookie('radiora_token', result.token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days to match JWT_EXPIRES_IN
      path: '/',
    });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function authStatus(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        maxConcurrentCases: true,
        createdAt: true,
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    return res.status(200).json({ ...user, adminId: req.user.adminId });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function logout(req, res) {
  const isSecure =
    process.env.NODE_ENV === 'production' ||
    process.env.SECURE_COOKIES === 'true' ||
    process.env.NODE_ENV !== 'test';
  res.clearCookie('radiora_token', {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? 'none' : 'lax',
    path: '/',
  });
  return res.status(200).json({ message: 'Logged out successfully.' });
}

module.exports = { register, login, authStatus, logout };
