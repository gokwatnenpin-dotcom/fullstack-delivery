import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { createOrder } from '../lib/api';
import { PinIcon, PackageIcon, CreditCardIcon, CheckCircleIcon, ArrowRightIcon, UserIcon } from '../components/Icons';

const SIZE_SUGGESTIONS = [
  { label: 'Small', hint: 'Envelope / docs', fee: '12.00' },
  { label: 'Medium', hint: 'Shoebox / food', fee: '25.00' },
  { label: 'Large', hint: 'Electronics box', fee: '32.50' },
  { label: 'XL', hint: 'Bulky / multi-item', fee: '50.00' },
];

const PAYMENT_OPTIONS = [
  { value: 'card', label: 'Card payment' },
  { value: 'cash', label: 'Cash on handover' },
  { value: 'transfer', label: 'Bank transfer' },
];

const inputCls =
  'w-full bg-[#f8fafc] border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-black focus:bg-white transition';

const Field = ({ label, htmlFor, icon, children, optional }) => (
  <div>
    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5" htmlFor={htmlFor}>
      {icon}
      {label}
      {optional && <span className="ml-1 font-normal text-slate-400">(optional)</span>}
    </label>
    {children}
  </div>
);

const NewOrderPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('delivery-token');

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    pickup_address: '',
    pickup_city: '',
    pickup_contact: '',
    pickup_phone: '',
    drop_address: '',
    drop_city: '',
    drop_contact: '',
    drop_phone: '',
    items: '',
    package_size: 'Medium',
    special_instructions: '',
    payment_method: 'card',
    amount: '25.00',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!token) return <Navigate to="/login" replace />;

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validateStep = (s) => {
    if (s === 1 && !form.pickup_address.trim()) return 'Add a pickup address to continue.';
    if (s === 2 && !form.drop_address.trim()) return 'Add a dropoff address to continue.';
    if (s === 3) {
      if (!form.items.trim()) return 'Describe the package contents.';
      const amount = parseFloat(form.amount);
      if (isNaN(amount) || amount <= 0) return 'Enter a valid delivery fee.';
    }
    return '';
  };

  const next = () => {
    const err = validateStep(step);
    if (err) return setError(err);
    setError('');
    setStep((s) => Math.min(s + 1, 3));
  };

  const back = () => {
    setError('');
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateStep(3);
    if (err) return setError(err);
    setError('');
    setLoading(true);

    try {
      const amount = parseFloat(form.amount);
      const itemsToSend =
        form.package_size && form.package_size !== 'Medium'
          ? `${form.package_size} parcel: ${form.items.trim()}`
          : form.items.trim();

      const orderData = {
        pickup_location: {
          address: form.pickup_address.trim(),
          city: form.pickup_city.trim() || undefined,
          contact_name: form.pickup_contact.trim() || undefined,
          contact_phone: form.pickup_phone.trim() || undefined,
        },
        delivery_location: {
          address: form.drop_address.trim(),
          city: form.drop_city.trim() || undefined,
          contact_name: form.drop_contact.trim() || undefined,
          contact_phone: form.drop_phone.trim() || undefined,
        },
        items: itemsToSend,
        special_instructions: form.special_instructions.trim(),
        payment_method: form.payment_method,
        amount,
      };

      const response = await createOrder(orderData);
      const newId = response.order?.id || response.id;
      setCreatedOrderId(newId);
      setSuccess(true);
      setTimeout(() => navigate(`/orders/${newId}`), 1600);
    } catch (err) {
      setError(err.message || 'Failed to dispatch order.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-[#f4f4f5] py-20 px-4 flex items-center justify-center">
        <div className="reveal w-full max-w-md rounded-2xl border border-black bg-[#0a0a0b] text-white p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-red-600 text-white mx-auto flex items-center justify-center mb-4">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Delivery created</h2>
          <p className="text-sm text-neutral-400 mt-1.5">
            Order #{createdOrderId} is live and broadcasting to nearby couriers.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2.5">
            <Link
              to={`/orders/${createdOrderId}`}
              className="btn-sleek inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-white hover:bg-red-600 hover:text-white text-black font-semibold text-sm transition"
            >
              Track order <ArrowRightIcon className="btn-arrow w-4 h-4" />
            </Link>
            <Link
              to="/dashboard"
              className="btn-sleek px-5 py-2.5 rounded-md border border-white/20 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const steps = [
    { n: 1, title: 'Pickup', sub: 'Where to collect' },
    { n: 2, title: 'Dropoff', sub: 'Where it goes' },
    { n: 3, title: 'Package', sub: 'Contents & payment' },
  ];

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f4f4f5] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="reveal rounded-2xl border border-black bg-[#0a0a0b] text-white p-6 sm:p-8 shadow-sm mb-6">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-300 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            New delivery
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create a delivery</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Add pickup and dropoff locations, package details, and payment — done in three quick steps.
          </p>

          {/* Stepper */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            {steps.map((s) => {
              const active = step === s.n;
              const done = step > s.n;
              return (
                <button
                  key={s.n}
                  type="button"
                  onClick={() => (s.n < step ? setStep(s.n) : null)}
                  className={`rounded-xl border px-3 py-2.5 text-left transition ${
                    active
                      ? 'border-white bg-white text-black'
                      : done
                        ? 'border-white/20 bg-white/10 text-white'
                        : 'border-white/10 bg-transparent text-neutral-500'
                  }`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider block">
                    {done ? '✓ ' : ''}Step {s.n}
                  </span>
                  <span className="text-sm font-semibold block">{s.title}</span>
                  <span className={`text-[11px] block ${active ? 'text-neutral-600' : 'text-neutral-500'}`}>{s.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
          {/* Form card */}
          <form onSubmit={handleSubmit} className="reveal reveal-1 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm">
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Pickup location</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Where should the courier collect the package?</p>
                </div>
                <Field label="Street address" htmlFor="pickup_address" icon={<PinIcon className="w-4 h-4 text-red-600" />}>
                  <input
                    id="pickup_address"
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. 104 Industrial Area, Gate 2"
                    value={form.pickup_address}
                    onChange={(e) => set('pickup_address', e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="City / area" htmlFor="pickup_city" optional>
                    <input
                      id="pickup_city"
                      type="text"
                      placeholder="e.g. Springfield"
                      value={form.pickup_city}
                      onChange={(e) => set('pickup_city', e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Sender name" htmlFor="pickup_contact" optional icon={<UserIcon className="w-4 h-4 text-slate-400" />}>
                    <input
                      id="pickup_contact"
                      type="text"
                      placeholder="Who hands over the package?"
                      value={form.pickup_contact}
                      onChange={(e) => set('pickup_contact', e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>
                <Field label="Sender phone" htmlFor="pickup_phone" optional>
                  <input
                    id="pickup_phone"
                    type="tel"
                    placeholder="e.g. +1 555 010 2233"
                    value={form.pickup_phone}
                    onChange={(e) => set('pickup_phone', e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Dropoff location</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Where should the courier deliver the package?</p>
                </div>
                <Field label="Street address" htmlFor="drop_address" icon={<PinIcon className="w-4 h-4 text-red-600" />}>
                  <input
                    id="drop_address"
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. 52 Downtown Tech Center, Suite 400"
                    value={form.drop_address}
                    onChange={(e) => set('drop_address', e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="City / area" htmlFor="drop_city" optional>
                    <input
                      id="drop_city"
                      type="text"
                      placeholder="e.g. Springfield"
                      value={form.drop_city}
                      onChange={(e) => set('drop_city', e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Recipient name" htmlFor="drop_contact" optional icon={<UserIcon className="w-4 h-4 text-slate-400" />}>
                    <input
                      id="drop_contact"
                      type="text"
                      placeholder="Who receives the package?"
                      value={form.drop_contact}
                      onChange={(e) => set('drop_contact', e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>
                <Field label="Recipient phone" htmlFor="drop_phone" optional>
                  <input
                    id="drop_phone"
                    type="tel"
                    placeholder="e.g. +1 555 010 8841"
                    value={form.drop_phone}
                    onChange={(e) => set('drop_phone', e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Package & payment</h2>
                  <p className="text-xs text-slate-500 mt-0.5">What&apos;s inside, and how do you want to pay?</p>
                </div>
                <Field label="Package contents" htmlFor="items" icon={<PackageIcon className="w-4 h-4 text-red-600" />}>
                  <input
                    id="items"
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Box of documents and spare parts"
                    value={form.items}
                    onChange={(e) => set('items', e.target.value)}
                    className={inputCls}
                  />
                </Field>

                <div>
                  <span className="block text-xs font-semibold text-slate-700 mb-2">Package size <span className="font-normal text-slate-400">(sets a suggested fee)</span></span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SIZE_SUGGESTIONS.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => { set('package_size', s.label); set('amount', s.fee); }}
                        className={`rounded-xl border px-3 py-2.5 text-left transition ${
                          form.package_size === s.label
                            ? 'border-black bg-[#0a0a0b] text-white'
                            : 'border-slate-200 bg-[#f8fafc] text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        <span className="text-xs font-bold block">{s.label}</span>
                        <span className={`text-[11px] block ${form.package_size === s.label ? 'text-neutral-400' : 'text-slate-400'}`}>{s.hint}</span>
                        <span className={`text-xs font-semibold block mt-1 ${form.package_size === s.label ? 'text-red-400' : 'text-red-600'}`}>${s.fee}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Field label="Delivery notes" htmlFor="special" optional>
                  <textarea
                    id="special"
                    rows="2"
                    placeholder="Gate code, floor number, recipient phone or instructions..."
                    value={form.special_instructions}
                    onChange={(e) => set('special_instructions', e.target.value)}
                    className={inputCls}
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Payment method" htmlFor="payment" icon={<CreditCardIcon className="w-4 h-4 text-red-600" />}>
                    <select
                      id="payment"
                      value={form.payment_method}
                      onChange={(e) => set('payment_method', e.target.value)}
                      className={inputCls}
                    >
                      {PAYMENT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Delivery fee ($)" htmlFor="amount">
                    <input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="1"
                      required
                      value={form.amount}
                      onChange={(e) => set('amount', e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>
              </div>
            )}

            {/* Nav buttons */}
            <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between gap-3">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={back}
                  className="btn-sleek px-5 py-2.5 rounded-md border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  ← Back
                </button>
              ) : (
                <Link to="/dashboard" className="text-xs font-medium text-slate-400 hover:text-slate-700 transition">
                  Cancel
                </Link>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={next}
                  className="btn-sleek inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-[#0a0a0b] hover:bg-red-600 text-white font-semibold text-sm transition"
                >
                  Continue <ArrowRightIcon className="btn-arrow w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-sleek px-6 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition disabled:opacity-50 shadow-sm"
                >
                  {loading ? 'Dispatching...' : 'Place delivery'}
                </button>
              )}
            </div>
          </form>

          {/* Live summary */}
          <aside className="reveal reveal-2 rounded-2xl border border-black bg-[#0a0a0b] text-white p-6 shadow-sm lg:sticky lg:top-24">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400 mb-4">Live summary</p>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-2.5">
                <PinIcon className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Pickup</div>
                  <div className="font-medium text-white truncate">{form.pickup_address || '—'}</div>
                  {(form.pickup_city || form.pickup_contact) && (
                    <div className="text-xs text-neutral-400">
                      {[form.pickup_city, form.pickup_contact].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
              </div>
              <div className="ml-[7px]" aria-hidden="true">
                <svg width="2" height="28" className="block">
                  <line x1="1" y1="0" x2="1" y2="28" stroke="#52525b" strokeWidth="2" className="route-line" />
                </svg>
              </div>
              <div className="flex items-start gap-2.5">
                <PinIcon className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Dropoff</div>
                  <div className="font-medium text-white truncate">{form.drop_address || '—'}</div>
                  {(form.drop_city || form.drop_contact) && (
                    <div className="text-xs text-neutral-400">
                      {[form.drop_city, form.drop_contact].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-white/10 space-y-2 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-neutral-500">Package</span>
                <span className="text-white font-medium text-right truncate max-w-[170px]">
                  {form.items ? `${form.package_size}: ${form.items}` : form.package_size}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Payment</span>
                <span className="text-white font-medium capitalize">{form.payment_method}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-neutral-500">Fee</span>
                <span className="text-red-400 font-bold text-base">${parseFloat(form.amount || 0).toFixed(2)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default NewOrderPage;
