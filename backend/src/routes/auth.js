import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const credentials = z.object({ email: z.string().email(), password: z.string().min(8), firstName: z.string().min(1), lastName: z.string().min(1) });
const publicUser = (user) => ({ id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, role: user.role });
const tokenFor = (user) => jwt.sign({ sub: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });

router.post('/register', async (req, res, next) => {
  try {
    const input = credentials.parse(req.body);
    const hash = await bcrypt.hash(input.password, 12);
    const user = await User.create({
      email: input.email,
      password_hash: hash,
      first_name: input.firstName,
      last_name: input.lastName,
      role: 'customer', // Default role for registration
      status: 'active'
    });

    // Create customer profile for new customers
    await require('../models/index.js').Customer.create({
      user_id: user.id
    });

    res.status(201).json({
      user: publicUser(user),
      token: tokenFor(user)
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const input = z.object({ email: z.string().email(), password: z.string() }).parse(req.body);
    const user = await User.findOne({
      where: {
        email: input.email,
        status: 'active'
      }
    });

    if (!user || !(await bcrypt.compare(input.password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      user: publicUser(user),
      token: tokenFor(user)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.sub, {
      attributes: ['id', 'email', 'first_name', 'last_name', 'role']
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

export default router;