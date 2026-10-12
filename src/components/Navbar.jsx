import { useEffect, useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { TruckIcon } from './Icons';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('delivery-user') || 'null'));
  const navigate = useNavigate();

  useEffect(() => {
    const update = () => setUser(JSON.parse(localStorage.getItem('delivery-user') || 'null'));
    window.addEventListener('delivery-auth-change', update);
    return () => window.removeEventListener('delivery-auth-change', update);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const logout = () => {
    localStorage.removeItem('delivery-token');
    localStorage.removeItem('delivery-user');
    setUser(null);
    setOpen(false);
    navigate('/');
  };

  const links = getNavLinks(user);

  return (
    <header
      className={`sticky top-0 z-50 bg-[#0a0a0b] text-white transition-shadow duration-300 ${
        scrolled ? 'shadow-[0_8px_30px_-12px_rgba(0,0,0,0.8)]' : 'shadow-none'
      } border-b border-white/10`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-[10px] bg-red-600 flex items-center justify-center text-white shadow-sm transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
            <TruckIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-lg font-bold tracking-tight text-white leading-tight">
              Delivery<span className="text-red-500">+</span>
            </span>
            <span className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-[0.18em]">
              Express Couriers
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-1 rounded-md border border-white/10 bg-white/5 p-1 md:flex">
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-white/10'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <div className="hidden sm:flex items-center gap-2.5">
              <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-md bg-white/5 text-neutral-200 border border-white/10">
                <span className="live-dot w-1.5 h-1.5 rounded-full bg-red-500" />
                {user.firstName || user.first_name} · {user.role}
              </span>
              <button
                type="button"
                onClick={logout}
                className="px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-white transition"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex px-3.5 py-1.5 text-sm font-medium text-neutral-300 hover:text-white transition"
            >
              Sign in
            </Link>
          )}

          <Link
            to={user ? "/dashboard" : "/register"}
            className="btn-sleek hidden sm:inline-flex px-4 py-2 rounded-md bg-white hover:bg-red-600 hover:text-white text-black font-semibold text-sm shadow-sm transition"
          >
            {user ? "Dashboard" : "Get Started"}
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-lg border border-white/15 text-neutral-300 hover:text-white hover:bg-white/10 md:hidden transition"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {open && (
        <div className="drawer-in border-t border-white/10 bg-[#0a0a0b] px-4 py-3 md:hidden space-y-1">
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          <div className="pt-2 border-t border-white/10 flex flex-col gap-1.5">
            {user ? (
              <button
                type="button"
                onClick={logout}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-white/5"
              >
                Sign out ({user.firstName || user.first_name})
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-neutral-300 hover:bg-white/10 hover:text-white"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white text-center text-black font-semibold text-sm"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

const getNavLinks = (user) => {
  if (!user) return [['/', 'Home']];
  const base = [
    ['/', 'Home'],
    ['/dashboard', 'Dashboard']
  ];
  if (user.role === 'customer') return [...base, ['/orders/new', 'New Delivery']];
  if (user.role === 'rider') return [...base, ['/riders/available', 'Available Jobs']];
  if (user.role === 'admin') return [...base, ['/admin/users', 'Manage Users']];
  return base;
};

export default Navbar;
