import { useState, useNavigate } from 'react';
import { createOrder } from '../lib/api';

const NewOrderPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    pickup_location: { address: '' },
    delivery_location: { address: '' },
    items: '',
    special_instructions: '',
    payment_method: 'card',
    amount: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!form.pickup_location.address || !form.delivery_location.address || !form.items || !form.amount) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Parse amount as float
      const amount = parseFloat(form.amount);
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid amount');
        setLoading(false);
        return;
      }

      const orderData = {
        pickup_location: { address: form.pickup_location.address },
        delivery_location: { address: form.delivery_location.address },
        items: form.items,
        special_instructions: form.special_instructions,
        payment_method: form.payment_method,
        amount: amount
      };

      const response = await createOrder(orderData);
      setSuccess(true);
      // Redirect to order confirmation page after a short delay
      setTimeout(() => {
        navigate(`/orders/${response.order.id}`);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <div className="min-h-screen bg-background-dark py-16 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-primary-900">Order Created Successfully!</h2>
          <p className="mt-2 text-sm text-text-secondary">Your delivery is now pending confirmation.</p>
          <Link to="/dashboard" className="mt-4 inline-block bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">Back to Dashboard</Link>
        </div>
      </div>
    </div>;
  }

  return <main className="bg-background-dark py-16"><div className="mx-auto max-w-2xl px-4 sm:px-6"><div className="bg-white rounded-2xl p-6 shadow-sm"><div className="mb-6"><p className="eyebrow">Delivery<span className="text-primary-600">+</span></p><h1 className="text-2xl font-bold text-primary-900">Create New Delivery</h1><p className="mt-2 text-sm text-text-secondary">Fill in the details below to create a new delivery request.</p></div><form onSubmit={handleSubmit} className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="pickup">Pickup Location</label><input className="block w-full rounded-lg border-0 bg-white px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600" id="pickup" placeholder="Enter pickup address" value={form.pickup_location.address} onChange={(e) => setForm({ ...form, pickup_location: { address: e.target.value } })} /></div><div><label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="delivery">Delivery Location</label><input className="block w-full rounded-lg border-0 bg-white px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600" id="delivery" placeholder="Enter delivery address" value={form.delivery_location.address} onChange={(e) => setForm({ ...form, delivery_location: { address: e.target.value } })} /></div></div><div><label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="items">Items Description</label><input className="block w-full rounded-lg border-0 bg-white px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600" id="items" placeholder="Describe the items to be delivered" value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} /></div><div><label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="special">Special Instructions (Optional)</label><textarea className="block w-full rounded-lg border-0 bg-white px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600" id="special" rows="3" placeholder="Any special instructions for the rider?" value={form.special_instructions} onChange={(e) => setForm({ ...form, special_instructions: e.target.value })} /></div><div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="payment">Payment Method</label><select className="block w-full rounded-lg border-0 bg-white px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600" id="payment" value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}><option value="cash">Cash</option><option value="card">Card</option><option value="transfer">Bank Transfer</option></select></div><div><label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="amount">Amount ($)</label><input className="block w-full rounded-lg border-0 bg-white px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600" id="amount" type="number" min="0" step="0.01" placeholder="Enter amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div></div>{error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}<button type="submit" disabled={loading} className="w-full rounded-lg bg-primary-700 px-4 py-3 font-semibold text-white hover:bg-primary-800 disabled:opacity-60">{loading ? 'Creating order…' : 'Create Delivery'}</button></form></div></div></main>;
};

export default NewOrderPage;