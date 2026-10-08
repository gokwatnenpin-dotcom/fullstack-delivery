import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getRiderProfile, updateRiderAvailability, getAvailableRiders, getOrders } from '../lib/api';

const RiderAvailabilityPage = () => {
  const [rider, setRider] = useState(null);
  const [availableRiders, setAvailableRiders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRiderData = async () => {
      try {
        setLoading(true);
        // Get current rider profile
        const riderData = await getRiderProfile();
        setRider(riderData);

        // Get available riders (for admin view or reference)
        const ridersData = await getAvailableRiders();
        setAvailableRiders(ridersData);

        // Get available orders (orders with status 'confirmed' and no rider assigned)
        const ordersData = await getOrders({});
        const availableOrdersData = ordersData.filter(order =>
          order.status === 'confirmed' && !order.rider_id
        );
        setAvailableOrders(availableOrdersData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadRiderData();
  }, []);

  const token = localStorage.getItem('delivery-token');
  if (!token) return <Navigate to="/login" replace />;

  const user = JSON.parse(localStorage.getItem('delivery-user') || '{}');
  if (!user || user.role !== 'rider') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleAvailabilityChange = async (status) => {
    try {
      await updateRiderAvailability(status);
      // Refresh rider data
      const updatedRider = await getRiderProfile();
      setRider(updatedRider);
    } catch (err) {
      setError('Failed to update availability: ' + err.message);
    }
  };

  return <main className="bg-background-dark py-16"><div className="mx-auto max-w-5xl px-4 sm:px-6"><div className="bg-white rounded-2xl p-6 shadow-sm"><div className="mb-6"><p className="eyebrow">Delivery<span className="text-primary-600">+</span></p><h1 className="text-2xl font-bold text-primary-900">Rider Availability</h1></div>{error && <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}<div className="space-y-6"><div className="border-b pb-4"><h2 className="text-xl font-semibold text-primary-900">Your Availability</h2><div className="flex items-center space-x-4"><div className="w-12 h-12 rounded-lg flex items-center justify-center">{getAvailabilityBadge(rider?.availability_status)}</div><div><p className="text-lg font-medium">{getAvailabilityLabel(rider?.availability_status)}</p><p className="text-sm text-text-secondary">Last updated: {new Date(rider?.updatedAt).toLocaleTimeString()}</p></div></div><div className="mt-4 space-x-3"><button onClick={() => handleAvailabilityChange('available')} className={`px-3 py-1 rounded text-sm font-medium ${rider?.availability_status === 'available' ? 'bg-primary-600 text-white' : 'bg-primary-50 text-primary-600 hover:bg-primary-100'`}>Available</button><button onClick={() => handleAvailabilityChange('busy')} className={`px-3 py-1 rounded text-sm font-medium ${rider?.availability_status === 'busy' ? 'bg-primary-600 text-white' : 'bg-primary-50 text-primary-600 hover:bg-primary-100'`}>Busy</button><button onClick={() => handleAvailabilityChange('offline')} className={`px-3 py-1 rounded text-sm font-medium ${rider?.availability_status === 'offline' ? 'bg-primary-600 text-white' : 'bg-primary-50 text-primary-600 hover:bg-primary-100'`}>Offline</button></div></div>{rider?.availability_status === 'available' && <div className="mt-4"><p className="text-sm font-medium text-text-secondary">You're currently available to accept delivery requests.</p></div>}</div>{availableRiders.length > 0 && <div className="border-t pt-6"><h2 className="text-xl font-semibold text-primary-900 mb-4">Currently Available Riders</h2><div className="space-y-3">{availableRiders.map((rider) => <div key={rider.id} className="rounded-lg border border-primary-100 p-4"><div className="flex justify-between items-start"><div><p className="font-medium">{rider.User.first_name} {rider.User.last_name}</p><p className="text-sm text-text-secondary">Rider #{rider.id}</p></div><div className="text-right">{getAvailabilityBadge(rider.availability_status, true)}</div></div><div className="mt-2"><p className="text-sm text-text-secondary">Vehicle: {(rider.vehicle_info && rider.vehicle_info.type) || 'Not specified'}</p><p className="text-sm text-text-secondary">Location: {(rider.current_location && `Lat: ${rider.current_location.latitude?.toFixed(4)}, Lng: ${rider.current_location.longitude?.toFixed(4)}`) || 'Not available'}</p></div></div>)}</div></div>}{availableOrders.length > 0 && <div className="border-t pt-6"><h2 className="text-xl font-semibold text-primary-900 mb-4">Available Delivery Requests</h2>{availableOrders.map((order) => <div key={order.id} className="rounded-lg border border-primary-100 p-4"><div className="flex justify-between items-start"><div><p className="font-medium">Order #{order.id}</p><p className="text-sm text-text-secondary">${new Date(order.createdAt).toLocaleString()}</p></div><div className="text-right"><button onClick={() => acceptOrder(order.id)} className="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700">Accept</button></div></div><div className="mt-2"><p className="text-sm text-text-secondary">From: {order.pickup_location?.address || 'Not specified'}</p><p className="text-sm text-text-secondary">To: {order.delivery_location?.address || 'Not specified'}</p></div>{order.items && <p className="text-sm text-text-secondary mb-1">Items: {order.items}</p>}{order.special_instructions && <p className="text-sm text-text-secondary">Special Instructions: {order.special_instructions}</p>}</div></div>)}</div>{availableRiders.length === 0 && availableOrders.length === 0 && <div className="text-center py-8"><p className="text-sm text-text-secondary">No data available at the moment.</p></div>}</div></div></main>;
};

const acceptOrder = async (orderId) => {
  try {
    // Update the order to assign it to the current rider and set status to assigned
    await updateOrderStatus(orderId, {
      status: 'assigned',
      rider_id: JSON.parse(localStorage.getItem('delivery-user') || '{}').id
    });
    // Refresh available orders
    const ordersData = await getOrders({});
    const availableOrdersData = ordersData.filter(order =>
      order.status === 'confirmed' && !order.rider_id
    );
    setAvailableOrders(availableOrdersData);

    // Show success message
    alert('Order accepted successfully! You can view it in your deliveries.');
    window.location.href = '/dashboard';
  } catch (err) {
    setError('Failed to accept order: ' + err.message);
  }
};

// Helper functions for availability status
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

  return `<span className="${paddingClass} rounded ${bgColor} ${textColor} ${sizeClass}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
};

const getAvailabilityLabel = (status) => {
  switch (status) {
    case 'available': return 'Available for deliveries';
    case 'busy': return 'Currently busy';
    case 'offline': return 'Offline / Not available';
    default: return status;
  }
};

export default RiderAvailabilityPage;