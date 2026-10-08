import { Router } from 'express';
import { Order, User } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Create a new order
router.post('/', authenticate, async (req, res, next) => {
  try {
    // Check if user is a customer
    if (req.user.role !== 'customer') {
      return res.status(403).json({ error: 'Only customers can create orders' });
    }

    const { pickup_location, delivery_location, items, special_instructions, payment_method, amount } = req.body;

    // Validate required fields
    if (!pickup_location || !delivery_location || !items || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const order = await Order.create({
      customer_id: req.user.sub,
      pickup_location,
      delivery_location,
      items,
      special_instructions: special_instructions || '',
      payment_method,
      amount,
      status: 'pending',
      payment_status: 'pending'
    });

    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
});

// Get customer's orders
router.get('/', authenticate, async (req, res, next) {
  try {
    let whereClause = {};

    // Filter by role
    if (req.user.role === 'customer') {
      whereClause.customer_id = req.user.sub;
    } else if (req.user.role === 'rider') {
      whereClause.rider_id = req.user.sub;
    } else if (req.user.role === 'admin') {
      // Admin can see all orders - no filter
    } else {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const orders = await Order.findAll({
      where: whereClause,
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

// Get order by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
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
      ]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check permissions
    if (req.user.role === 'customer' && order.customer_id !== req.user.sub) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    if (req.user.role === 'rider' && order.rider_id !== req.user.sub) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Admin can see any order

    res.json({ order });
  } catch (error) {
    next(error);
  }
});

// Update order status (for riders/admins)
router.patch('/:id/status', authenticate, async (req, res, next) => {
  try {
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check permissions
    if (req.user.role === 'rider') {
      // Riders can only update orders assigned to them
      if (order.rider_id !== req.user.sub) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      // Riders can only update to certain statuses
      const riderAllowedStatuses = ['confirmed', 'picked_up', 'in_transit', 'delivered'];
      if (!riderAllowedStatuses.includes(status)) {
        return res.status(403).json({ error: 'Riders cannot update to this status' });
      }
    } else if (req.user.role !== 'admin') {
      // Only riders and admins can update order status
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Business logic for status transitions
    const currentStatus = order.status;

    // Define valid transitions
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['assigned', 'cancelled'],
      assigned: ['picked_up', 'cancelled'],
      picked_up: ['in_transit', 'cancelled'],
      in_transit: ['delivered', 'cancelled'],
      delivered: [], // Final state
      cancelled: []  // Final state
    };

    if (!validTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({ error: `Invalid status transition from ${currentStatus} to ${status}` });
    }

    // Update the order
    await order.update({ status });

    // If order is being assigned to a rider, update the rider_id
    if (status === 'assigned' && req.body.rider_id) {
      // Verify the rider exists and is available
      const rider = await User.findOne({
        where: { id: req.body.rider_id, role: 'rider', status: 'active' }
      });

      if (!rider) {
        return res.status(400).json({ error: 'Invalid rider ID' });
      }

      const riderProfile = await require('../models/index.js').Rider.findOne({
        where: { user_id: req.body.rider_id, availability_status: 'available' }
      });

      if (!riderProfile) {
        return res.status(400).json({ error: 'Rider is not available' });
      }

      await order.update({ rider_id: req.body.rider_id });
    }

    const updatedOrder = await Order.findByPk(req.params.id, {
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
      ]
    });

    res.json({ order: updatedOrder });
  } catch (error) {
    next(error);
  }
});

export default router;