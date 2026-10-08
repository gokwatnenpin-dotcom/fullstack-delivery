import { Router } from 'express';
import { Rider, User } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get rider profile
router.get('/me', authenticate, async (req, res, next) => {
  try {
    // Check if user is a rider
    if (req.user.role !== 'rider') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const rider = await Rider.findOne({
      where: { user_id: req.user.sub },
      include: [{
        model: User,
        attributes: ['id', 'email', 'first_name', 'last_name', 'role', 'status']
      }]
    });

    if (!rider) {
      return res.status(404).json({ error: 'Rider profile not found' });
    }

    res.json({ rider });
  } catch (error) {
    next(error);
  }
});

// Update rider profile
router.put('/me', authenticate, async (req, res, next) => {
  try {
    // Check if user is a rider
    if (req.user.role !== 'rider') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { vehicle_info, license_info, availability_status, current_location } = req.body;

    const [updated] = await Rider.update(
      { vehicle_info, license_info, availability_status, current_location },
      { where: { user_id: req.user.sub } }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Rider profile not found' });
    }

    const updatedRider = await Rider.findOne({
      where: { user_id: req.user.sub },
      include: [{
        model: User,
        attributes: ['id', 'email', 'first_name', 'last_name', 'role', 'status']
      }]
    });

    res.json({ rider: updatedRider });
  } catch (error) {
    next(error);
  }
});

// Update rider availability
router.patch('/availability', authenticate, async (req, res, next) => {
  try {
    // Check if user is a rider
    if (req.user.role !== 'rider') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { availability_status } = req.body;

    // Validate availability status
    const validStatuses = ['available', 'busy', 'offline'];
    if (!validStatuses.includes(availability_status)) {
      return res.status(400).json({ error: 'Invalid availability status' });
    }

    const [updated] = await Rider.update(
      { availability_status },
      { where: { user_id: req.user.sub } }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Rider not found' });
    }

    res.json({ message: 'Availability status updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Get available riders (for admin/dispatch)
router.get('/available', authenticate, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const availableRiders = await Rider.findAll({
      where: { availability_status: 'available' },
      include: [{
        model: User,
        attributes: ['id', 'email', 'first_name', 'last_name']
      }]
    });

    res.json({ riders: availableRiders });
  } catch (error) {
    next(error);
  }
});

export default router;