import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export function authenticate(req, res, next) {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Verify user still exists and is active
    User.findByPk(decoded.sub, {
      attributes: ['id', 'email', 'first_name', 'last_name', 'role', 'status']
    }).then(user => {
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      if (user.status !== 'active') {
        return res.status(401).json({ error: 'Account is not active' });
      }
      req.user = user;
      return next();
    }).catch(err => {
      return res.status(401).json({ error: 'Invalid or expired token' });
    });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Insufficient permissions' });
  next();
};