import { useMemo, useState } from 'react';

const inputClass = 'block w-full rounded-lg border-0 bg-white px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 transition placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm';

const providers = [
  { value: 'sarah-chen', name: 'Dr. Sarah Chen', specialty: 'Cardiology' },
  { value: 'michael-rodriguez', name: 'Dr. Michael Rodriguez', specialty: 'Pediatrics' },
  { value: 'amanda-foster', name: 'Dr. Amanda Foster', specialty: 'Mental Health' },
  { value: 'david-kim', name: 'Dr. David Kim', specialty: 'General Consultation' },
  { value: 'lisa-wong', name: 'Dr. Lisa Wong', specialty: 'Laboratory Tests' },
];

const times = ['9:00 AM', '9:30 AM', '10:30 AM', '11:00 AM', '1:00 PM', '1:30 PM', '2:30 PM', '3:00 PM'];

const toDateInputValue = (date) => {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 10);
};

const formatDate = (date) => new Intl.DateTimeFormat('en-US', {
  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
}).format(new Date(`${date}T12:00:00`));

const Feature = ({ icon, title, children }) => (
  <div className="flex gap-4">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">{icon}</div>
    <div><h3 className="font-medium text-primary-900">{title}</h3><p className="mt-0.5 text-sm leading-relaxed text-text-secondary">{children}</p></div>
  </div>
);

const Contact = () => {
  const today = useMemo(() => toDateInputValue(new Date()), []);
  const [form, setForm] = useState({ name: '', email: '', phone: '', provider: '', date: '', time: '', visitType: 'In-person', notes: '' });
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const selectedProvider = providers.find((provider) => provider.value === form.provider);
  const isWeekend = form.date && [0, 6].includes(new Date(`${form.date}T12:00:00`).getDay());

  const updateField = ({ target: { name, value } }) => {
    setForm((current) => ({ ...current, [name]: value, ...(name === 'date' ? { time: '' } : {}) }));
    setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isWeekend) return setError('Appointments are available Monday through Friday. Please choose another date.');
    if (!form.time) return setError('Please select an available appointment time.');
    const appointment = { ...form, providerName: selectedProvider.name, specialty: selectedProvider.specialty, id: `MC-${Date.now().toString().slice(-6)}` };
    const appointments = JSON.parse(localStorage.getItem('medicare-appointments') || '[]');
    localStorage.setItem('medicare-appointments', JSON.stringify([...appointments, appointment]));
    setConfirmation(appointment);
  };

  const bookAnother = () => {
    setConfirmation(null);
    setForm({ name: '', email: '', phone: '', provider: '', date: '', time: '', visitType: 'In-person', notes: '' });
  };

  return (
    <section id="contact" className="bg-background-dark py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">Appointments</p>
          <h1 className="text-3xl font-bold text-primary-900 sm:text-4xl">Book your appointment</h1>
          <p className="mt-4 leading-relaxed text-text-secondary">Choose the care you need, select a convenient time, and we&apos;ll take care of the rest.</p>
        </div>
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-12">
          <aside className="lg:pt-5">
            <h2 className="text-2xl font-semibold text-primary-900">Care that fits your schedule</h2>
            <p className="mt-4 leading-relaxed text-text-secondary">New and returning patients can request an in-person or virtual visit in just a few steps.</p>
            <div className="mt-8 space-y-5">
              <Feature title="Weekday appointments" icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>}>Monday–Friday, 9:00 AM–3:30 PM</Feature>
              <Feature title="Choose your time" icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>}>Available 30-minute appointment slots</Feature>
              <Feature title="Private and simple" icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg>}>Your request is saved only on this device</Feature>
            </div>
            <div className="mt-10 rounded-xl border border-primary-100 bg-primary-50 p-5"><p className="font-medium text-primary-900">Need urgent care?</p><p className="mt-1 text-sm leading-relaxed text-text-secondary">For a medical emergency, call 911. For urgent questions, call <a className="font-medium text-primary-700 hover:underline" href="tel:+15551234567">+1 (555) 123-4567</a>.</p></div>
          </aside>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-8">
            {confirmation ? (
              <div className="py-4 text-center" role="status">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary-100 text-secondary-700"><svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="m5 12 4.5 4.5L19 7" /></svg></div>
                <h2 className="mt-5 text-2xl font-semibold text-primary-900">Appointment requested</h2>
                <p className="mx-auto mt-2 max-w-md leading-relaxed text-text-secondary">Thanks, {confirmation.name.split(' ')[0]}. We&apos;ll send confirmation details to {confirmation.email} shortly.</p>
                <div className="mx-auto mt-7 max-w-md rounded-xl bg-background-dark p-5 text-left"><p className="text-xs font-semibold uppercase tracking-wider text-primary-600">Booking {confirmation.id}</p><p className="mt-2 font-semibold text-primary-900">{confirmation.providerName}</p><p className="text-sm text-text-secondary">{confirmation.specialty} · {confirmation.visitType}</p><p className="mt-4 text-sm font-medium text-primary-900">{formatDate(confirmation.date)} at {confirmation.time}</p></div>
                <button type="button" onClick={bookAnother} className="mt-7 inline-flex min-h-11 items-center justify-center rounded-lg border border-primary-200 px-6 py-2.5 text-sm font-medium text-primary-700 transition hover:bg-primary-50 focus:ring-4 focus:ring-primary-100">Book another appointment</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-7">
                <div><h2 className="text-2xl font-semibold text-primary-900">Tell us about your visit</h2><p className="mt-1 text-sm text-text-secondary">All fields marked with * are required.</p></div>
                <div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">Full name *</label><input id="name" name="name" type="text" autoComplete="name" required value={form.name} onChange={updateField} className={inputClass} placeholder="Jane Doe" /></div><div><label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">Phone number *</label><input id="phone" name="phone" type="tel" autoComplete="tel" required value={form.phone} onChange={updateField} className={inputClass} placeholder="(555) 123-4567" /></div></div>
                <div><label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">Email address *</label><input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={updateField} className={inputClass} placeholder="jane@example.com" /></div>
                <div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="provider" className="mb-2 block text-sm font-medium text-gray-700">Provider *</label><select id="provider" name="provider" required value={form.provider} onChange={updateField} className={inputClass}><option value="">Select a provider</option>{providers.map((provider) => <option key={provider.value} value={provider.value}>{provider.name} — {provider.specialty}</option>)}</select></div><div><label htmlFor="date" className="mb-2 block text-sm font-medium text-gray-700">Preferred date *</label><input id="date" name="date" type="date" min={today} required value={form.date} onChange={updateField} className={inputClass} /></div></div>
                <fieldset><legend className="mb-3 text-sm font-medium text-gray-700">Visit type *</legend><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{['In-person', 'Virtual visit'].map((type) => <label key={type} className={`flex min-h-12 cursor-pointer items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium transition ${form.visitType === type ? 'border-primary-600 bg-primary-50 text-primary-800 ring-1 ring-primary-600' : 'border-slate-200 text-gray-700 hover:border-primary-200'}`}><input className="sr-only" type="radio" name="visitType" value={type} checked={form.visitType === type} onChange={updateField} />{type}</label>)}</div></fieldset>
                <fieldset><legend className="mb-3 text-sm font-medium text-gray-700">Available time *</legend>{!form.date ? <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-text-secondary">Select a date to view available times.</p> : isWeekend ? <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">We&apos;re closed on weekends. Please choose a weekday.</p> : <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">{times.map((time) => <button key={time} type="button" onClick={() => { setForm((current) => ({ ...current, time })); setError(''); }} className={`min-h-11 rounded-lg border px-3 py-2.5 text-sm font-medium transition focus:ring-2 focus:ring-primary-300 ${form.time === time ? 'border-primary-600 bg-primary-600 text-white' : 'border-slate-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50'}`} aria-pressed={form.time === time}>{time}</button>)}</div>}</fieldset>
                <div><label htmlFor="notes" className="mb-2 block text-sm font-medium text-gray-700">Reason for visit <span className="font-normal text-gray-400">(optional)</span></label><textarea id="notes" name="notes" rows="3" maxLength="500" value={form.notes} onChange={updateField} className={inputClass} placeholder="Briefly tell us how we can help." /></div>
                {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
                <div className="pt-1"><button type="submit" className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-700 focus:ring-4 focus:ring-primary-300">Request appointment</button><p className="mt-3 text-center text-xs leading-relaxed text-text-secondary">Submitting requests your time; a member of our care team will confirm it with you.</p></div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
