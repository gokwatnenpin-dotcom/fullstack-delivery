import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('delivery-user') || 'null'));
  const navigate = useNavigate();

  useEffect(() => {
    const update = () => setUser(JSON.parse(localStorage.getItem('delivery-user') || 'null'));
    window.addEventListener('delivery-auth-change', update);
    return () => window.removeEventListener('delivery-auth-change', update);
  }, []);

  const logout = () => {
    localStorage.removeItem('delivery-token');
    localStorage.removeItem('delivery-user');
    setUser(null);
    setOpen(false);
    navigate('/');
  };

  const navClass = ({ isActive }) => 
    `text-sm font-medium transition ${isActive ? 'text-primary-700' : 'text-text-secondary hover:text-primary-800'}`;

  return (
    <header className="sticky top-0 z-50 border-b border-primary-100/70 bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo / Brand */}
        <NavLink to="/" className="flex items-center gap-3" aria-label="Delivery Platform home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-700 text-white shadow-sm">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <span>
            <span className="block text-lg font-bold leading-none tracking-tight text-primary-900">
              Delivery<span className="text-primary-600">+</span>
            </span>
            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[.16em] text-text-secondary">
              Deliveries made simple
            </span>
          </span>
        </NavLink>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-7 md:flex">
          {getNavLinks(user).map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} className={navClass}>
              {label}
            </NavLink>
          ))}
        </div>

        {/* Desktop Dynamic Action Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* FIXED: Changed user.first_name to user.firstName to match AuthPage payload */}
              <NavLink to="/dashboard" className="hidden text-sm font-semibold text-primary-700 sm:inline-flex">
                {user.firstName || user.first_name}
              </NavLink>
              <button 
                type="button" 
                onClick={logout} 
                className="hidden rounded-lg border border-primary-200 px-3 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50 sm:inline-flex"
              >
                Sign out
              </button>
            </>
          ) : (
            <NavLink 
              to="/login" 
              className="hidden rounded-lg border border-primary-200 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50 sm:inline-flex"
            >
              Sign in
            </NavLink>
          )}

          <NavLink 
            to={user ? "/dashboard" : "/login?mode=register"} 
            className="hidden rounded-lg bg-primary-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-800 sm:inline-flex"
          >
            {user ? 'Dashboard' : 'Get Started'}
          </NavLink>

          {/* Mobile Hamburger Toggle Button */}
          <button 
            type="button" 
            onClick={() => setOpen(!open)} 
            aria-expanded={open} 
            aria-label="Toggle navigation" 
            className="rounded-lg p-2 text-primary-800 hover:bg-primary-50 md:hidden"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Panel */}
      {open && (
        <div className="border-t border-primary-100 bg-white px-4 py-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {getNavLinks(user).map(([to, label]) => (
              <NavLink 
                key={to} 
                to={to} 
                end={to === '/'} 
                onClick={() => setOpen(false)} 
                className={({ isActive }) => 
                  `rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-text-secondary'}`
                }
              >
                {label}
              </NavLink>
            ))}

            {user ? (
              <>
                <button 
                  type="button" 
                  onClick={logout} 
                  className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <NavLink 
                  to="/login" 
                  onClick={() => setOpen(false)} 
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-gray-50"
                >
                  Sign in
                </NavLink>
                <NavLink 
                  to="/login?mode=register" 
                  onClick={() => setOpen(false)} 
                  className="mt-2 rounded-lg bg-primary-700 px-3 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Create Account
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

// Helper function to get navigation links based on user role
const getNavLinks = (user) => {
  if (!user) return [['/', 'Home']]; // Show Home if not authenticated

  const baseLinks = [['/dashboard', 'Dashboard']];

  if (user.role === 'customer') {
    return [...baseLinks, ['/orders/new', 'New Order']];
  } else if (user.role === 'rider') {
    return [...baseLinks, ['/riders/available', 'Available Orders']];
  } else if (user.role === 'admin') {
    return [...baseLinks, ['/admin/users', 'Users']];
  }

  return baseLinks;
};

export default Navbar;
