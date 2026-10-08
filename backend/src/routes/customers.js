import { Router } from 'express';
import { Customer, User } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get customer profile
router.get('/me', authenticate, async (req, res, next) => {
  try {
    // Check if user is a customer
    if (req.user.role !== 'customer') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const customer = await Customer.findOne({
      where: { user_id: req.user.sub },
      include: [{
        model: User,
        attributes: ['id', 'email', 'first_name', 'last_name', 'role', 'status']
      }]
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer profile not found' });
    }

    res.json({ customer });
  } catch (error) {
    next(error);
  }
});

// Update customer profile
router.put('/me', authenticate, async (req, res, next) => {
  try {
    // Check if user is a customer
    if (req.user.role !== 'customer') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { phone, address } = req.body;

    const [updated] = await Customer.update(
      { phone, address },
      { where: { user_id: req.user.sub } }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Customer profile not found' });
    }

    const updatedCustomer = await Customer.findOne({
      where: { user_id: req.user.sub },
      include: [{
        model: User,
        attributes: ['id', 'email', 'first_name', 'last_name', 'role', 'status']
      }]
    });

    res.json({ customer: updatedCustomer });
  } catch (error) {
    next(error);
  }
});

export default router;