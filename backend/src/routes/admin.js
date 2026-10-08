import { Router } from 'express';
import { User, Order, Rider } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get all users (admin only)
router.get('/users', authenticate, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const users = await User.findAll({
      attributes: ['id', 'email', 'first_name', 'last_name', 'role', 'status', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json({ users });
  } catch (error) {
    next(error);
  }
});

// Get user by ID (admin only)
router.get('/users/:id', authenticate, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'email', 'first_name', 'last_name', 'role', 'status', 'createdAt', 'updatedAt']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Update user status (admin only)
router.patch('/users/:id/status', authenticate, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { status } = req.body;

    // Validate status
    const validStatuses = ['active', 'inactive', 'suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const [updated] = await User.update(
      { status },
      { where: { id: req.params.id } }
    );

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Get all orders (admin only)
router.get('/orders', authenticate, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const orders = await Order.findAll({
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'email', 'first_name', 'last_name']
        },
        {
          model: User,
          as: 'rider',
          attributes: ['id', 'email', 'first_name', 'last_name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

// Get all riders (admin only)
router.get('/riders', authenticate, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const riders = await Rider.findAll({
      include: [{
        model: User,
        attributes: ['id', 'email', 'first_name', 'last_name', 'status']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ riders });
  } catch (error) {
    next(error);
  }
});

// Update rider availability (admin can override)
router.patch('/riders/:id/availability', authenticate, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
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
      { where: { id: req.params.id } }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Rider not found' });
    }

    res.json({ message: 'Rider availability updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Get platform statistics (admin only)
router.get('/stats', authenticate, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const [usersCount, ordersCount, ridersCount] = await Promise.all[
      User.count(),
      Order.count(),
      Rider.count()
    ];

    const [activeRidersCount, pendingOrdersCount, deliveredOrdersCount] = await Promise.all[
      Rider.count({ where: { availability_status: 'available' } }),
      Order.count({ where: { status: 'pending' } }),
      Order.count({ where: { status: 'delivered' } })
    ];

    res.json({
      stats: {
        users: usersCount,
        orders: ordersCount,
        riders: ridersCount,
        active_riders: activeRidersCount,
        pending_orders: pendingOrdersCount,
        delivered_orders: deliveredOrdersCount
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;