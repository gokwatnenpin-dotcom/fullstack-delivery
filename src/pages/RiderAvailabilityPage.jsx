import { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom'; // FIXED: Added Navigate import
import { 
  getRiderProfile, 
  updateRiderAvailability, 
  getAvailableRiders, 
  getOrders, 
  updateOrderStatus // FIXED: Added missing API hook import
} from '../lib/api';

const RiderAvailabilityPage = () => {
  const [rider, setRider] = useState(null);
  const [availableRiders, setAvailableRiders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadRiderData = async () => {
      try {
        setLoading(true);
        const riderData = await getRiderProfile();
        setRider(riderData);

        const ridersData = await getAvailableRiders();
        setAvailableRiders(ridersData);

        const ordersData = await getOrders({});
        const availableOrdersData = ordersData.filter(order =>
          order.status === 'confirmed' && !order.rider_id
        );
        setAvailableOrders(availableOrdersData);
      } catch (err) {
        setError(err.message || 'Failed to load rider telemetry data.');
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem('delivery-token');
    const user = JSON.parse(localStorage.getItem('delivery-user') || '{}');
    if (token && user?.role === 'rider') {
      loadRiderData();
    }
  }, []);

  const token = localStorage.getItem('delivery-token');
  if (!token) return <Navigate to="/login" replace />;

  const user = JSON.parse(localStorage.getItem('delivery-user') || '{}');
  if (!user || user.role !== 'rider') {
    return <Navigate to="/dashboard" replace />;
  }

  // FIXED: Standard loading skeleton guard to prevent UI null pointer crashes
  if (loading) {
    return (
      <main className="bg-background-dark py-16">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full border-4 border-primary-600 border-t-transparent w-12 h-12"></div>
        </div>
      </main>
    );
  }

  const handleAvailabilityChange = async (status) => {
    try {
      await updateRiderAvailability(status);
      const updatedRider = await getRiderProfile();
      setRider(updatedRider);
    } catch (err) {
      setError('Failed to update availability: ' + err.message);
    }
  };

  const acceptOrder = async (orderId) => {
    try {
      await updateOrderStatus(orderId, {
        status: 'assigned',
        rider_id: user.id
      });
      
      const ordersData = await getOrders({});
      const availableOrdersData = ordersData.filter(order =>
        order.status === 'confirmed' && !order.rider_id
      );
      setAvailableOrders(availableOrdersData);

      alert('Order accepted successfully! Redirecting to your dashboard workspace.');
      navigate('/dashboard'); // FIXED: Swapped window.location.href for SPA navigate transition
    } catch (err) {
      setError('Failed to accept order: ' + err.message);
    }
  };

  const getAvailabilityBadge = (status, isSmall = false) => {
    let bgColor = 'bg-primary-50';
    let textColor = 'text-primary-600';

    switch (status) {
      case 'available':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'busy':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case 'offline':
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        break;
    }

    const sizeClass = isSmall ? 'text-xs' : 'text-sm';
    const paddingClass = isSmall ? 'px-2 py-1' : 'px-3 py-2';

    return (
      <span className={`${paddingClass} rounded-md font-semibold ${bgColor} ${textColor} ${sizeClass}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
      </span>
    );
  };

  const getAvailabilityLabel = (status) => {
    switch (status) {
      case 'available': return 'Available for deliveries';
      case 'busy': return 'Currently busy';
      case 'offline': return 'Offline / Not available';
      default: return 'No Status Determined';
    }
  };

  return (
    <main className="bg-background-dark py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm sm:p-8">
          
          <div className="mb-6">
            <p className="eyebrow">Delivery<span className="text-primary-600">+</span></p>
            <h1 className="text-2xl font-bold text-primary-900 mt-1">Rider Availability</h1>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700 mb-6" role="alert">
              {error}
            </p>
          )}

          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-6">
              <h2 className="text-xl font-semibold text-primary-900 mb-4">Your Availability Status</h2>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center">
                  {getAvailabilityBadge(rider?.availability_status)}
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {getAvailabilityLabel(rider?.availability_status)}
                  </p>
                  <p className="text-sm text-text-secondary mt-0.5">
                    Last updated: {rider?.updatedAt ? new Date(rider.updatedAt).toLocaleTimeString() : 'Never'}
                  </p>
                </div>
              </div>

              {/* FIXED: Repaired broken string syntax interpolation brackets */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button 
                  type="button"
                  onClick={() => handleAvailabilityChange('available')} 
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    rider?.availability_status === 'available' 
                      ? 'bg-primary-600 text-white shadow-sm' 
                      : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                  }`}
                >
                  Available
                </button>
                <button 
                  type="button"
                  onClick={() => handleAvailabilityChange('busy')} 
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    rider?.availability_status === 'busy' 
                      ? 'bg-amber-600 text-white shadow-sm' 
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  Busy
                </button>
                <button 
                  type="button"
                  onClick={() => handleAvailabilityChange('offline')} 
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    rider?.availability_status === 'offline' 
                      ? 'bg-gray-600 text-white shadow-sm' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Offline
                </button>
              </div>

              {rider?.availability_status === 'available' && (
                <div className="mt-4 rounded-lg bg-green-50/50 p-3 border border-green-100/50">
                  <p className="text-sm font-medium text-green-800">
                    You're currently live! Open orders will register dynamically below.
                  </p>
                </div>
              )}
            </div>

            {/* ORDER POOL SECTION (Rendered out for implementation visibility) */}
            <div className="pt-2">
              <h2 className="text-xl font-semibold text-primary-900 mb-4">Open Confirmed Orders Pool</h2>
              {availableOrders.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {availableOrders.map((order) => (
                    <div key={order.id} className="border border-gray-100 rounded-xl p-4 shadow-sm bg-white flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-gray-900 text-sm">Order #{order.id}</span>
                          <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1"><b className="text-gray-700">From:</b> {order.pickup_location?.address}</p>
                        <p className="text-xs text-gray-600"><b className="text-gray-700">To:</b> {order.delivery_location?.address}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => acceptOrder(order.id)}
                        className="mt-4 w-full bg-primary-700 hover:bg-primary-800 text-white rounded-lg text-xs font-bold py-2 transition"
                      >
                        Accept Job assignment
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-secondary italic">No unassigned confirmed orders available right now.</p>
              )}
            </div>

          </div>
        </div>
      </div>
    </main>
  );
};

export default RiderAvailabilityPage;
