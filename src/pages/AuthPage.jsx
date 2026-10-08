import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { login, register, getMe } from '../lib/api';

const inputClass = 'block w-full rounded-lg border-0 bg-white px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600';

const AuthPage = () => {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get('mode') === 'register' ? 'register' : 'login');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      let result;
      if (mode === 'login') {
        result = await login({ email: form.email, password: form.password });
      } else {
        // For registration, we need to send firstName and lastName
        result = await register({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName
        });
      }

      localStorage.setItem('delivery-token', result.token);
      localStorage.setItem('delivery-user', JSON.stringify(result.user));
      window.dispatchEvent(new Event('delivery-auth-change'));
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return <main className="bg-background-dark py-16 sm:py-24"><div className="mx-auto max-w-md px-4"><div className="rounded-2xl border border-primary-100 bg-white p-6 shadow-sm sm:p-8"><div className="text-center"><p className="eyebrow">Delivery<span className="text-primary-600">+</span></p><h1 className="mt-3 text-3xl font-bold text-primary-900">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1><p className="mt-2 text-sm text-text-secondary">{mode === 'login' ? 'Sign in to manage your deliveries.' : 'Join us to manage your delivery services.'}</p></div><form onSubmit={submit} className="mt-8 space-y-5">{mode === 'register' && <div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="firstName">First name</label><input className={inputClass} id="firstName" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div><div><label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="lastName">Last name</label><input className={inputClass} id="lastName" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div></div>}<div><label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="email">Email address</label><input className={inputClass} id="email" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div><div><label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="password">Password</label><input className={inputClass} id="password" type="password" minLength="8" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>{error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}<button disabled={busy} className="w-full rounded-lg bg-primary-700 px-4 py-3 font-semibold text-white hover:bg-primary-800 disabled:opacity-60">{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button></form><p className="mt-6 text-center text-sm text-text-secondary">{mode === 'login' ? 'New to Delivery+?' : 'Already have an account?'} <button type="button" className="font-semibold text-primary-700" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></p><p className="mt-4 text-center text-xs text-text-secondary"><Link to="/" className="hover:text-primary-700">Return to home</Link></p></div></div></main>;
};

export default AuthPage;