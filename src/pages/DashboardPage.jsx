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
import { PackageIcon, PinIcon, ArrowRightIcon, TruckIcon } from '../components/Icons';

const DashboardPage = () => {
  const token = localStorage.getItem('delivery-token');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const userData = await getMe();
        const actualUser = userData.user || userData;
        setUser(actualUser);

        if (actualUser.role === 'customer') {
          const customerData = await getCustomerProfile().catch(() => null);
          setProfile(customerData?.customer || customerData);
          const ordersData = await getOrders({});
          setOrders(ordersData.orders || ordersData || []);
        } else if (actualUser.role === 'rider') {
          const riderData = await getRiderProfile().catch(() => null);
          setProfile(riderData?.rider || riderData);
          const ordersData = await getOrders({});
          setOrders(ordersData.orders || ordersData || []);
        } else if (actualUser.role === 'admin') {
          const adminStats = await getAdminStats().catch(() => null);
          setStats(adminStats);
          const allOrders = await getOrders({});
          setOrders(allOrders.orders || allOrders || []);
        }
      } catch (err) {
        setError(err.message || 'Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadDashboardData();
    }
  }, [token]);

  if (!token) return <Navigate to="/login" replace />;

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { status: newStatus });
      const updatedOrders = await getOrders({});
      setOrders(updatedOrders.orders || updatedOrders || []);
    } catch (err) {
      setError('Failed to update status: ' + err.message);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    return o.status === filterStatus;
  });

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#eaecf0] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Welcome Header Banner */}
        <div className="reveal rounded-2xl border border-black bg-[#0a0a0b] text-white p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-bold text-neutral-300 uppercase tracking-[0.18em] mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {user ? `${user.role} Dashboard` : 'Dashboard'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {user ? `Welcome, ${user.first_name || user.firstName}` : 'Dashboard'}
              </h1>
              <p className="mt-1 text-sm text-neutral-400">
                Manage package dispatches, track active orders, and monitor statuses.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              {user?.role === 'customer' && (
                <Link
                  to="/orders/new"
                  className="btn-sleek px-4 py-2 rounded-md bg-white hover:bg-red-600 text-black hover:text-white font-semibold text-sm shadow-sm transition"
                >
                  + New Delivery
                </Link>
              )}
              {user?.role === 'rider' && (
                <Link
                  to="/riders/available"
                  className="btn-sleek inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white hover:bg-red-600 hover:text-white text-black font-semibold text-sm shadow-sm transition"
                >
                  <TruckIcon className="w-4 h-4" /> Available Jobs
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link
                  to="/admin/users"
                  className="btn-sleek px-4 py-2 rounded-md bg-transparent hover:bg-white/10 text-white border border-white/20 font-medium text-sm transition"
                >
                  Manage Users
                </Link>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-600">
            {error}
          </div>
        )}

        {/* ADMIN OVERVIEW CARDS */}
        {user?.role === 'admin' && stats && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Platform Metrics
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Total Users', val: stats.stats?.users || 0 },
                { label: 'Total Orders', val: stats.stats?.orders || 0 },
                { label: 'Active Riders', val: stats.stats?.active_riders || 0 },
                { label: 'Pending Orders', val: stats.stats?.pending_orders || 0 },
                { label: 'Delivered', val: stats.stats?.delivered_orders || 0 },
                { label: 'Fleet Couriers', val: stats.stats?.riders || 0 },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[#d0d5dd] bg-white p-4 shadow-sm"
                >
                  <div className="text-xs text-slate-500 font-medium">{item.label}</div>
                  <div className="mt-1.5 text-2xl font-bold text-slate-900">
                    {item.val}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ORDERS WORKSPACE CONTAINER */}
        <div className="rounded-xl border border-[#d0d5dd] bg-white p-6 shadow-sm">
          
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {user?.role === 'customer'
                  ? 'Your Orders'
                  : user?.role === 'rider'
                  ? 'Your Deliveries'
                  : 'All Platform Orders'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {orders.length} total orders recorded
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200">
              {['all', 'pending', 'confirmed', 'assigned', 'picked_up', 'in_transit', 'delivered'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition ${
                    filterStatus === st
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              <span className="inline-block spin text-xl text-red-600 mb-2">⚙</span>
              <p>Loading orders...</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-slate-200 bg-[#f8fafc] p-5 flex flex-col justify-between hover:border-slate-300 hover:bg-white transition shadow-xs"
                >
                  <div>
                    {/* Top Order Row */}
                    <div className="flex justify-between items-start pb-3 mb-3 border-b border-slate-200">
                      <div>
                        <span className="text-xs text-slate-400">Order ID</span>
                        <div className="text-base font-bold text-slate-900">
                          #{order.id}
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-white text-slate-700 border border-slate-200 capitalize">
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Routing Details */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-1.5">
                        <PinIcon className="w-3.5 h-3.5 text-red-600 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-slate-500 font-medium">Pickup: </span>
                          <span className="text-slate-800">{order.pickup_location?.address}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <PinIcon className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-slate-500 font-medium">Dropoff: </span>
                          <span className="text-slate-800">{order.delivery_location?.address}</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-200 text-slate-500 flex items-center gap-1.5">
                        <PackageIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>Cargo: </span>
                        <span className="text-slate-800 font-medium truncate">{order.items}</span>
                      </div>
                      <div className="flex justify-between pt-1 text-slate-500">
                        <span>Price: <b className="text-slate-900">${parseFloat(order.amount || 0).toFixed(2)}</b></span>
                        <span>Payment: <b className="text-slate-900 capitalize">{order.payment_status}</b></span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                    <Link
                      to={`/orders/${order.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 transition"
                    >
                      View Details <ArrowRightIcon className="w-3 h-3" />
                    </Link>

                    {/* Rider Quick Buttons */}
                    {user?.role === 'rider' && order.rider_id === user.id && (
                      <div className="flex gap-1.5">
                        {order.status === 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(order.id, 'picked_up')}
                            className="px-2.5 py-1 rounded bg-red-600 text-white text-xs font-medium hover:bg-red-700"
                          >
                            Pick Up
                          </button>
                        )}
                        {order.status === 'picked_up' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(order.id, 'in_transit')}
                            className="px-2.5 py-1 rounded bg-slate-800 text-white text-xs font-medium hover:bg-slate-700"
                          >
                            In Transit
                          </button>
                        )}
                        {order.status === 'in_transit' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                            className="px-2.5 py-1 rounded bg-red-600 text-white text-xs font-medium hover:bg-red-700"
                          >
                            Deliver
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-14 text-center rounded-lg border border-slate-200 text-slate-500 text-sm bg-[#f8fafc]">
              No orders found matching "{filterStatus}".
              {user?.role === 'customer' && (
                <div className="mt-3">
                  <Link
                    to="/orders/new"
                    className="inline-block px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700"
                  >
                    Create Delivery
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </main>
  );
};

export default DashboardPage;
