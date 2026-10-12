import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { 
  getRiderProfile, 
  updateRiderAvailability, 
  getOrders, 
  updateOrderStatus
} from '../lib/api';
import { TruckIcon, PinIcon, PackageIcon } from '../components/Icons';

const RiderAvailabilityPage = () => {
  const [rider, setRider] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('delivery-token');
  const user = JSON.parse(localStorage.getItem('delivery-user') || '{}');

  const loadRiderData = async () => {
    try {
      setLoading(true);
      const riderData = await getRiderProfile().catch(() => null);
      setRider(riderData?.rider || riderData);

      const ordersData = await getOrders({});
      const rawOrders = ordersData.orders || ordersData || [];
      const unassignedOrders = rawOrders.filter(
        order => (order.status === 'confirmed' || order.status === 'pending') && !order.rider_id
      );
      setAvailableOrders(unassignedOrders);
    } catch (err) {
      setError(err.message || 'Failed to sync rider dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.role === 'rider') {
      loadRiderData();
    }
  }, []);

  if (!token) return <Navigate to="/login" replace />;
  if (!user || user.role !== 'rider') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleAvailabilityChange = async (status) => {
    try {
      setActionBusy(true);
      await updateRiderAvailability(status);
      const updatedRider = await getRiderProfile();
      setRider(updatedRider.rider || updatedRider);
    } catch (err) {
      setError('Status update failed: ' + err.message);
    } finally {
      setActionBusy(false);
    }
  };

  const acceptOrder = async (orderId) => {
    try {
      setActionBusy(true);
      await updateOrderStatus(orderId, {
        status: 'assigned',
        rider_id: user.id
      });
      navigate(`/orders/${orderId}`);
    } catch (err) {
      setError('Assignment failed: ' + err.message);
      setActionBusy(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f8fafc] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-red-600">
                Courier Workspace
              </span>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Availability & Jobs
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Set your status to accept nearby delivery assignments.
              </p>
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-1.5">
              <span className={`w-2 h-2 rounded-full ${rider?.availability_status === 'available' ? 'bg-red-600' : 'bg-slate-400'}`} />
              <span className="text-xs font-medium text-slate-700 capitalize">
                Status: {rider?.availability_status || 'offline'}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-600">
            {error}
          </div>
        )}

        {/* Status Switcher */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
            Update Availability
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'available', label: 'Available', desc: 'Ready for delivery jobs' },
              { key: 'busy', label: 'Busy', desc: 'Currently handling a job' },
              { key: 'offline', label: 'Offline', desc: 'Not accepting deliveries' }
            ].map(btn => (
              <button
                key={btn.key}
                type="button"
                disabled={actionBusy}
                onClick={() => handleAvailabilityChange(btn.key)}
                className={`rounded-lg border p-4 text-left transition ${
                  rider?.availability_status === btn.key
                    ? 'border-red-600 bg-red-50 text-red-700 font-semibold shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="text-sm font-semibold">{btn.label}</div>
                <div className="text-xs opacity-75 mt-0.5">{btn.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Live Broadcast Jobs Pool */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-5 border-b border-slate-200 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Available Delivery Jobs
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {availableOrders.length} unassigned orders waiting for pickup
              </p>
            </div>
            <button
              type="button"
              onClick={loadRiderData}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              <span className="inline-block spin text-xl text-red-600 mb-2">⚙</span>
              <p>Scanning for nearby orders...</p>
            </div>
          ) : availableOrders.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {availableOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between hover:border-slate-300 transition shadow-sm"
                >
                  <div>
                    <div className="flex justify-between items-start pb-3 mb-3 border-b border-slate-100">
                      <span className="text-sm font-bold text-slate-900">Order #{order.id}</span>
                      <span className="text-sm font-bold text-red-600">${parseFloat(order.amount || 0).toFixed(2)}</span>
                    </div>

                    <div className="space-y-1.5 text-xs">
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
                      <div className="pt-2 text-slate-500 flex items-center gap-1.5 border-t border-slate-100">
                        <PackageIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Cargo: </span>
                        <span className="text-slate-800 font-medium truncate">{order.items}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={actionBusy}
                    onClick={() => acceptOrder(order.id)}
                    className="mt-5 w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition disabled:opacity-50 shadow-sm"
                  >
                    Accept Job
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-14 text-center rounded-lg border border-slate-200 text-slate-500 text-xs">
              No unassigned delivery orders available right now.
              <p className="mt-1 text-slate-400 text-[11px]">Check back shortly or refresh the list.</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
};

export default RiderAvailabilityPage;
