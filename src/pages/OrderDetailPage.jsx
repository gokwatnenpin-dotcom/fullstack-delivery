import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { getOrderById, updateOrderStatus, getPaymentByOrderId, updatePaymentStatus } from '../lib/api';
import { PinIcon, PackageIcon, CreditCardIcon, UserIcon, ArrowRightIcon } from '../components/Icons';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const token = localStorage.getItem('delivery-token');
  const user = JSON.parse(localStorage.getItem('delivery-user') || '{}');

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        const orderData = await getOrderById(id);
        const actualOrder = orderData.order || orderData;
        setOrder(actualOrder);

        const paymentData = await getPaymentByOrderId(id).catch(() => null);
        setPayment(paymentData?.payment || paymentData);
      } catch (err) {
        setError('Failed to load order details for #' + id);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrderData();
    }
  }, [id, token]);

  if (!token) return <Navigate to="/login" replace />;

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-[#eaecf0] py-20 flex items-center justify-center">
        <div className="rounded-xl border border-[#d0d5dd] bg-white p-8 text-center text-slate-500 shadow-sm">
          <div className="spin text-xl text-red-600 mb-2">⚙</div>
          <p className="text-sm">Loading order #{id}...</p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-[#eaecf0] py-20 flex items-center justify-center">
        <div className="rounded-xl border border-[#d0d5dd] bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-700 mb-4">Order #{id} was not found.</p>
          <Link to="/dashboard" className="px-5 py-2 rounded-lg bg-red-600 text-white text-xs font-medium">
            Return to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await updateOrderStatus(id, { status: newStatus });
      const updatedOrder = await getOrderById(id);
      setOrder(updatedOrder.order || updatedOrder);
    } catch (err) {
      setError('Status update error: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleSimulatePayment = async () => {
    try {
      setUpdating(true);
      await updatePaymentStatus(id, {
        status: 'successful',
        transaction_id: 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase()
      });
      const updatedOrder = await getOrderById(id);
      setOrder(updatedOrder.order || updatedOrder);
      const paymentData = await getPaymentByOrderId(id).catch(() => null);
      setPayment(paymentData?.payment || paymentData);
    } catch (err) {
      setError('Payment error: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const steps = [
    { key: 'pending', label: 'Registered' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'picked_up', label: 'In Transit' },
    { key: 'delivered', label: 'Delivered' }
  ];

  const currentStepIdx = steps.findIndex(s => s.key === order.status);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#eaecf0] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        
        {/* Header */}
        <div className="rounded-xl border border-[#d0d5dd] bg-white p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                Order Tracking
              </span>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Delivery #{order.id}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                {order.status.replace('_', ' ')}
              </span>
              <Link
                to="/dashboard"
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-xs transition"
              >
                ← Back
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-600">
            {error}
          </div>
        )}

        {/* Stepper */}
        <div className="rounded-xl border border-[#d0d5dd] bg-white p-6 shadow-sm mb-6">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Delivery Milestones
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {steps.map((st, idx) => {
              const isPastOrCurrent = currentStepIdx >= idx;
              const isCurrent = order.status === st.key;
              return (
                <div
                  key={st.key}
                  className={`rounded-lg border p-3 text-center transition ${
                    isCurrent
                      ? 'border-red-600 bg-red-50 text-red-600 font-bold'
                      : isPastOrCurrent
                      ? 'border-slate-300 bg-slate-100 text-slate-900 font-medium'
                      : 'border-slate-200 bg-[#f8fafc] text-slate-400'
                  }`}
                >
                  <div className="text-xs">{st.label}</div>
                  {isCurrent && <div className="text-[10px] mt-0.5 text-red-600 font-semibold">• Active</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          
          {/* Main Info */}
          <div className="md:col-span-2 rounded-xl border border-[#d0d5dd] bg-white p-6 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-4 flex items-center gap-1.5">
              <PinIcon className="w-4 h-4" /> Routing Information
            </h3>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="rounded-lg border border-slate-200 bg-[#f8fafc] p-4">
                <span className="text-slate-500 font-semibold block mb-1">Pickup Address:</span>
                <p className="text-slate-900 font-medium">{order.pickup_location?.address}</p>
                {(order.pickup_location?.city || order.pickup_location?.contact_name || order.pickup_location?.contact_phone) && (
                  <p className="text-slate-500 text-xs mt-1">
                    {[order.pickup_location?.city, order.pickup_location?.contact_name, order.pickup_location?.contact_phone].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 bg-[#f8fafc] p-4">
                <span className="text-slate-500 font-semibold block mb-1">Delivery Address:</span>
                <p className="text-slate-900 font-medium">{order.delivery_location?.address}</p>
                {(order.delivery_location?.city || order.delivery_location?.contact_name || order.delivery_location?.contact_phone) && (
                  <p className="text-slate-500 text-xs mt-1">
                    {[order.delivery_location?.city, order.delivery_location?.contact_name, order.delivery_location?.contact_phone].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 bg-[#f8fafc] p-4 flex items-start gap-2">
                <PackageIcon className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-500 font-semibold block mb-0.5">Package Contents:</span>
                  <p className="text-slate-900 font-medium">{order.items}</p>
                </div>
              </div>

              {order.special_instructions && (
                <div className="rounded-lg border border-slate-200 bg-[#f8fafc] p-4">
                  <span className="text-slate-500 font-semibold block mb-1">Special Instructions:</span>
                  <p className="text-slate-700">{order.special_instructions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Courier & Finance */}
          <div className="space-y-6">
            
            {/* Courier Card */}
            <div className="rounded-xl border border-[#d0d5dd] bg-white p-6 shadow-sm text-xs">
              <h3 className="font-semibold uppercase tracking-wider text-red-600 mb-3 flex items-center gap-1.5">
                <UserIcon className="w-4 h-4" /> Assigned Courier
              </h3>
              {order.rider ? (
                <div>
                  <div className="text-sm font-bold text-slate-900 mb-1">
                    {order.rider.first_name} {order.rider.last_name}
                  </div>
                  <p className="text-slate-500">{order.rider.email}</p>
                  <div className="mt-2.5 inline-block px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                    Courier ID #{order.rider_id}
                  </div>
                </div>
              ) : (
                <div className="text-slate-500">
                  <p className="italic">No courier assigned yet.</p>
                  <p className="text-xs mt-1 text-slate-400">Broadcasting to couriers nearby</p>
                </div>
              )}
            </div>

            {/* Financial Info */}
            <div className="rounded-xl border border-[#d0d5dd] bg-white p-6 shadow-sm text-xs">
              <h3 className="font-semibold uppercase tracking-wider text-red-600 mb-3 flex items-center gap-1.5">
                <CreditCardIcon className="w-4 h-4" /> Payment Details
              </h3>
              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery Fee:</span>
                  <span className="text-slate-900 font-bold text-sm">
                    ${parseFloat(order.amount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Method:</span>
                  <span className="text-slate-900 capitalize">{order.payment_method || 'Card'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-semibold capitalize text-slate-900">
                    {order.payment_status}
                  </span>
                </div>

                {user.role === 'admin' && order.payment_status !== 'successful' && (
                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    disabled={updating}
                    className="w-full mt-3 py-2 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 text-xs font-medium transition"
                  >
                    Simulate Payment Complete
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Operational Bar */}
        <div className="rounded-xl border border-[#d0d5dd] bg-white p-6 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-3">
            Status Actions
          </h3>

          <div className="flex flex-wrap gap-2.5">
            {/* If unassigned rider accepts */}
            {user.role === 'rider' && !order.rider_id && order.status === 'confirmed' && (
              <button
                type="button"
                onClick={() => handleStatusUpdate('assigned')}
                disabled={updating}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs shadow-sm transition"
              >
                Accept Courier Job
              </button>
            )}

            {/* Workflow steps */}
            {(order.rider_id === user.id || user.role === 'admin') && (
              <>
                {['pending', 'confirmed'].includes(order.status) && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate('confirmed')}
                    disabled={updating}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-medium transition"
                  >
                    Confirm Order
                  </button>
                )}
                {['confirmed', 'assigned'].includes(order.status) && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate('picked_up')}
                    disabled={updating}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition shadow-sm"
                  >
                    Mark Picked Up
                  </button>
                )}
                {order.status === 'picked_up' && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate('in_transit')}
                    disabled={updating}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-white text-xs font-medium hover:bg-slate-700 transition"
                  >
                    In Transit
                  </button>
                )}
                {order.status === 'in_transit' && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate('delivered')}
                    disabled={updating}
                    className="px-5 py-2 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition shadow-sm"
                  >
                    Mark as Delivered
                  </button>
                )}
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate('cancelled')}
                    disabled={updating}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:text-red-600 transition"
                  >
                    Cancel Order
                  </button>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </main>
  );
};

export default OrderDetailPage;