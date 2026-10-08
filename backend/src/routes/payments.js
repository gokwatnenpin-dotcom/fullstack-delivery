import { Router } from 'express';
import { Payment, Order } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get payment for an order
router.get('/:orderId', authenticate, async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId);

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

    // Admin can see any payment

    const payment = await Payment.findOne({
      where: { order_id: req.params.orderId }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found for this order' });
    }

    res.json({ payment });
  } catch (error) {
    next(error);
  }
});

// Update payment status (simulate payment processing)
router.patch('/:orderId', authenticate, async (req, res, next) => {
  try {
    const { status, transaction_id, payment_details } = req.body;

    // Validate status
    const validStatuses = ['pending', 'successful', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }

    const order = await Order.findByPk(req.params.orderId);

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

    // Only admins can update payment status (in a real app, this would come from payment webhook)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Find existing payment or create new one
    let payment = await Payment.findOne({
      where: { order_id: req.params.orderId }
    });

    if (!payment) {
      // Create payment record
      payment = await Payment.create({
        order_id: req.params.orderId,
        amount: order.amount,
        method: order.payment_method || 'card',
        status,
        transaction_id,
        payment_details
      });
    } else {
      // Update existing payment
      await payment.update({
        status,
        transaction_id,
        payment_details
      });
    }

    // Update order payment status
    await order.update({ payment_status: status });

    // If payment is successful, confirm the order
    if (status === 'successful' && order.status === 'pending') {
      await order.update({ status: 'confirmed' });
    }

    const updatedPayment = await Payment.findByPk(payment.id);

    res.json({ payment: updatedPayment });
  } catch (error) {
    next(error);
  }
});

export default router;