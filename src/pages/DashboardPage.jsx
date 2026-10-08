import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  getMe,
  getCustomerProfile,
  getRiderProfile,
  getOrders,
  getAdminStats,
  updateOrderStatus
} from '../lib/api';

const DashboardPage = () => {
  const token = localStorage.getItem('delivery-token');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Get user info
        const userData = await getMe();
        setUser(userData);

        // Load role-specific data
        if (userData.role === 'customer') {
          const customerData = await getCustomerProfile();
          setProfile(customerData);
          const customerOrders = await getOrders({});
          setOrders(customerOrders);
        } else if (userData.role === 'rider') {
          const riderData = await getRiderProfile();
          setProfile(riderData);
          const riderOrders = await getOrders({});
          setOrders(riderOrders);
        } else if (userData.role === 'admin') {
          const adminStats = await getAdminStats();
          setStats(adminStats);
          const allOrders = await getOrders({});
          setOrders(allOrders);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadDashboardData();
    }
  }, [token]);

  if (!token) return <Navigate to="/login" replace />;
  if (loading) return <main className="bg-background-dark py-16"><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full border-4 border-primary-600 border-t-transparent w-12 h-12"></div></div></main>;

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { status: newStatus });
      // Refresh orders after update
      const updatedOrders = await getOrders({});
      setOrders(updatedOrders);
    } catch (err) {
      setError('Failed to update order status: ' + err.message);
    }
  };
return (
  <main className="bg-background-dark py-16">
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      
      {/* Header Info Bar */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Delivery<span className="text-primary-600">+</span></p>
          <h1 className="mt-2 text-4xl font-bold text-primary-900">
            {user ? `Hello, ${user.first_name}` : 'Welcome'}
          </h1>
          <p className="mt-2 text-text-secondary">Manage your delivery services efficiently.</p>
        </div>
        {user.role === 'customer' && (
          <Link to="/orders/new" className="rounded-lg bg-primary-700 px-4 py-3 text-sm font-semibold text-white">
            New Delivery
          </Link>
        )}
        {user.role === 'rider' && (
          <Link to="/riders/available" className="rounded-lg bg-primary-700 px-4 py-3 text-sm font-semibold text-white">
            Available Deliveries
          </Link>
        )}
      </div>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {/* Customer Panel */}
      {user.role === 'customer' && (
        <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-primary-900">Your Orders</h2>
          {orders.length ? (
            <div className="mt-4 space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="rounded-lg border border-primary-100 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-primary-900">Order #{order.id}</p>
                      <p className="mt-1 text-sm text-text-secondary">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-text-secondary">From: {order.pickup_location?.address || 'Pickup location'}</p>
                    <p className="text-sm text-text-secondary">To: {order.delivery_location?.address || 'Delivery location'}</p>
                  </div>
                  {order.rider_id && (
                    <div className="mt-2 text-sm text-text-secondary">Assigned to: Rider #{order.rider_id}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-text-secondary">
              No orders yet.{' '}
              <Link className="font-semibold text-primary-700" to="/orders/new">
                Create your first delivery.
              </Link>
            </p>
          )}
        </section>
      )}

      {/* Rider Panel */}
      {user.role === 'rider' && (
        <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-primary-900">Your Deliveries</h2>
          {orders.length ? (
            <div className="mt-4 space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="rounded-lg border border-primary-100 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-primary-900">Order #{order.id}</p>
                      <p className="mt-1 text-sm text-text-secondary">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-text-secondary">From: {order.pickup_location?.address || 'Pickup location'}</p>
                    <p className="text-sm text-text-secondary">To: {order.delivery_location?.address || 'Delivery location'}</p>
                  </div>
                  {!order.rider_id && <div className="mt-2 text-sm text-text-secondary">Waiting for assignment</div>}
                  {order.rider_id && order.rider_id === user.id && (
                    <div className="mt-2">
                      {order.status === 'confirmed' && (
                        <button onClick={() => handleUpdateOrderStatus(order.id, 'picked_up')} className="bg-primary-600 text-white px-3 py-1 rounded text-sm">
                          Pick Up
                        </button>
                      )}
                      {order.status === 'picked_up' && (
                        <button onClick={() => handleUpdateOrderStatus(order.id, 'in_transit')} className="bg-primary-600 text-white px-3 py-1 rounded text-sm">
                          Start Transit
                        </button>
                      )}
                      {order.status === 'in_transit' && (
                        <button onClick={() => handleUpdateOrderStatus(order.id, 'delivered')} className="bg-primary-600 text-white px-3 py-1 rounded text-sm">
                          Deliver
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-text-secondary">No deliveries assigned yet.</p>
          )}
        </section>
      )}

      {/* Admin Panel */}
      {user.role === 'admin' && (
        <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-primary-900">Platform Overview</h2>
          {stats ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-primary-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-text-secondary">Total Users</p>
                <p className="text-2xl font-bold text-primary-900">{stats.stats?.users || 0}</p>
              </div>
              <div className="bg-primary-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-text-secondary">Total Orders</p>
                <p className="text-2xl font-bold text-primary-900">{stats.stats?.orders || 0}</p>
              </div>
              <div className="bg-primary-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-text-secondary">Total Riders</p>
                <p className="text-2xl font-bold text-primary-900">{stats.stats?.riders || 0}</p>
              </div>
              <div className="bg-primary-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-text-secondary">Active Riders</p>
                <p className="text-2xl font-bold text-primary-900">{stats.stats?.active_riders || 0}</p>
              </div>
              <div className="bg-primary-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-text-secondary">Pending Orders</p>
                <p className="text-2xl font-bold text-primary-900">{stats.stats?.pending_orders || 0}</p>
              </div>
              <div className="bg-primary-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-text-secondary">Delivered Today</p>
                <p className="text-2xl font-bold text-primary-900">{stats.stats?.delivered_orders || 0}</p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-text-secondary">Loading statistics...</p>
          )}
        </section>
      )}

    </div>
  </main>
);
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

export default DashboardPage;