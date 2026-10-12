import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { login, register } from '../lib/api';
import { TruckIcon } from '../components/Icons';

const AuthPage = () => {
  const [params, setParams] = useSearchParams();
  const [mode, setMode] = useState(params.get('mode') === 'register' ? 'register' : 'login');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const urlMode = params.get('mode');
    if (urlMode === 'register' || urlMode === 'login') {
      setMode(urlMode);
    }
  }, [params]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setError('');
    setParams({ mode: newMode });
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      let result;
      if (mode === 'login') {
        result = await login({ email: form.email, password: form.password });
      } else {
        result = await register({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
        });
      }

      localStorage.setItem('delivery-token', result.token);
      localStorage.setItem('delivery-user', JSON.stringify(result.user));
      window.dispatchEvent(new Event('delivery-auth-change'));
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError.message || 'An error occurred during authentication.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f4f4f5] py-16 px-4 flex items-center justify-center">
      <div className="reveal w-full max-w-md">
        
        {/* Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 sm:p-10 shadow-sm overflow-hidden">
          <div className="rounded-xl bg-[#0a0a0b] text-white px-5 py-4 mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-red-600 text-white flex items-center justify-center shrink-0">
              <TruckIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold leading-tight">Delivery+</div>
              <div className="text-[11px] text-neutral-400">Secure sign-in · live tracking</div>
            </div>
          </div>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {mode === 'login' ? 'Sign in to account' : 'Create an account'}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
              {mode === 'login'
                ? 'Enter your email and password to access your deliveries'
                : 'Register as a customer to dispatch shipments in seconds'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-lg bg-slate-100 p-1 mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => handleModeChange('login')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('register')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition"
                    placeholder="Alex"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition"
                    placeholder="Morgan"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition"
                placeholder="alex@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                minLength="8"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-6 w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {busy ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center pt-4 border-t border-slate-200">
            <Link to="/" className="text-xs text-slate-500 hover:text-red-600 transition">
              ← Return to homepage
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
};

export default AuthPage;
