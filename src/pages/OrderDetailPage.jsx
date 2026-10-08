import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOrderById, updateOrderStatus } from '../lib/api';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const orderData = await getOrderById(id);
        setOrder(orderData);
      } catch (err) {
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (!order) {
    if (loading) return <div className="min-h-screen bg-background-dark py-16 flex items-center justify-center"><div className="animate-spin rounded-full border-4 border-primary-600 border-t-transparent w-12 h-12"></div></div>;
    return <Navigate to="/dashboard" replace />;
  }

  // Check if user has permission to view this order
  const user = JSON.parse(localStorage.getItem('delivery-user') || '{}');
  const token = localStorage.getItem('delivery-token');

  if (!token) return <Navigate to="/login" replace />;

  const hasPermission =
    user.role === 'admin' ||
    (user.role === 'customer' && order.customer_id === user.id) ||
    (user.role === 'rider' && order.rider_id === user.id);

  if (!hasPermission) {
    return <div className="min-h-screen bg-background-dark py-16 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600">You don't have permission to view this order.</p>
        <Link to="/dashboard" className="mt-4 inline-block bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">Back to Dashboard</Link>
      </div>
    </div>;
  }

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await updateOrderStatus(id, { status: newStatus });
      // Refresh order data
      const updatedOrder = await getOrderById(id);
      setOrder(updatedOrder);
    } catch (err) {
      setError('Failed to update order status: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  return <main className="bg-background-dark py-16"><div className="mx-auto max-w-4xl px-4 sm:px-6"><div className="bg-white rounded-2xl p-6 shadow-sm"><div className="mb-6"><p className="eyebrow">Delivery<span className="text-primary-600">+</span></p><h1 className="text-2xl font-bold text-primary-900">Order Details</h1></div><div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2"><div><p className="text-sm font-medium text-text-secondary">Order ID</p><p className="text-lg font-medium text-primary-900">#{order.id}</p></div><div><p className="text-sm font-medium text-text-secondary">Status</p><span className={`px-3 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>{order.status}</span></div><div><p className="text-sm font-medium text-text-secondary">Created At</p><p className="text-lg font-medium text-primary-900">{new Date(order.createdAt).toLocaleString()}</p></div>{order.updatedAt && <div><p className="text-sm font-medium text-text-secondary">Updated At</p><p className="text-lg font-medium text-primary-900">{new Date(order.updatedAt).toLocaleString()}</p></div>}</div><div className="border-t pt-6"><p className="text-sm font-medium text-text-secondary mb-2">Pickup Location</p><p className="text-lg break-all">{order.pickup_location?.address || 'Not specified'}</p></div><div className="border-t pt-6"><p className="text-sm font-medium text-text-secondary mb-2">Delivery Location</p><p className="text-lg break-all">{order.delivery_location?.address || 'Not specified'}</p></div>{order.items && <div className="border-t pt-6"><p className="text-sm font-medium text-text-secondary mb-2">Items</p><p className="text-lg break-all">{order.items}</p></div>}{order.special_instructions && <div className="border-t pt-6"><p className="text-sm font-medium text-text-secondary mb-2">Special Instructions</p><p className="text-lg break-all">{order.special_instructions}</p></div>}<div className="border-t pt-6"><p className="text-sm font-medium text-text-secondary mb-2">Payment Information</p><div className="space-y-2"><p className="text-sm">Method: {order.payment_method || 'Not specified'}</p><p className="text-sm">Amount: ${order.amount ? parseFloat(order.amount).toFixed(2) : '0.00'}</p><p className="text-sm">Status: <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>{order.payment_status}</span></p></div></div>{order.rider_id && <div className="border-t pt-6"><p className="text-sm font-medium text-text-secondary mb-2">Assigned Rider</p><p className="text-lg">Rider #{order.rider_id}</p></div>}</div>{(!order.rider_id && user.role === 'rider') && <div className="mt-6"><button onClick={() => handleStatusUpdate('assigned')} disabled={updating} className="w-full rounded-lg bg-primary-600 text-white px-4 py-2 font-semibold hover:bg-primary-700 disabled:opacity-50">{updating ? 'Assigning…' : 'Accept this Delivery'}</button></div>}{((order.rider_id === user.id || user.role === 'admin') && ['confirmed', 'assigned', 'picked_up', 'in_transit'].includes(order.status)) && <div className="mt-6 space-y-3"><div className="text-sm font-medium text-text-secondary mb-2">Update Status</div><div className="space-y-2"><button onClick={() => handleStatusUpdate('picked_up')} disabled={updating || !['confirmed', 'assigned'].includes(order.status)} className="w-full rounded-lg bg-primary-600 text-white px-3 py-2 font-semibold hover:bg-primary-700 disabled:opacity-50">{updating && order.status === 'confirmed' ? 'Picking up…' : 'Pick Up'}</button>{order.status === 'picked_up' && <button onClick={() => handleStatusUpdate('in_transit')} disabled={updating} className="w-full rounded-lg bg-primary-600 text-white px-3 py-2 font-semibold hover:bg-primary-700 disabled:opacity-50 mt-2">{updating ? 'Starting transit…' : 'Start Transit'}</button>}{order.status === 'in_transit' && <button onClick={() => handleStatusUpdate('delivered')} disabled={updating} className="w-full rounded-lg bg-primary-600 text-white px-3 py-2 font-semibold hover:bg-primary-700 disabled:opacity-50 mt-2">{updating ? 'Delivering…' : 'Mark as Delivered'}</button>}</div></div>}{(order.status === 'delivered' || order.status === 'cancelled') && <div className="mt-6"><Link to="/dashboard" className="inline-block bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">Back to Dashboard</Link></div>}</div></div></main>;
};

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'confirmed': return 'bg-blue-100 text-blue-800';
    case 'assigned': return 'bg-purple-100 text-purple-800';
    case 'picked_up': return 'bg-orange-100 text-orange-800';
    case 'in_transit': return 'bg-indigo-100 text-indigo-800';
    case 'delivered': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Helper function to get payment status color
const getPaymentStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'successful': return 'bg-green-100 text-green-800';
    case 'failed': return 'bg-red-100 text-red-800';
    case 'refunded': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default OrderDetailPage;