const { verifyToken } = require('../utils/jwt');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token =
    (req.cookies && req.cookies.radiora_token) ||
    (authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null);

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. No token provided.' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    return res
      .status(401)
      .json({ error: 'Unauthorized. Invalid or expired token.' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res
        .status(403)
        .json({ error: `Forbidden. Requires ${role} role.` });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole };
