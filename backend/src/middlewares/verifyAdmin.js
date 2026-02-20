import jwt from 'jsonwebtoken';

/**
 * Expects: Authorization: Bearer <token>
 * On success: sets req.admin = { admin_id, username }
 * On failure: 401 with { error }
 */
export function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error('[verifyAdmin] JWT_SECRET is not set');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.admin = {
      admin_id: decoded.admin_id,
      username: decoded.username,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
}
