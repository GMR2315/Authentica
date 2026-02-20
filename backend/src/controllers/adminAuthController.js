import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

/**
 * POST /api/admin/login
 * Body: { username, password }
 * Returns: { token } (JWT)
 * No registration — single admin inserted manually in DB.
 */
export async function loginHandler(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const admin = await prisma.admin.findUnique({
      where: { username: username.trim() },
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('[admin auth] JWT_SECRET is not set');
      return res.status(500).json({ error: 'Server configuration error.' });
    }

    const payload = {
      admin_id: admin.admin_id,
      username: admin.username,
    };

    const token = jwt.sign(payload, secret, { expiresIn: '1d' });

    return res.json({ token });
  } catch (err) {
    console.error('[admin login]', err);
    return res.status(500).json({ error: 'Login failed.' });
  }
}
