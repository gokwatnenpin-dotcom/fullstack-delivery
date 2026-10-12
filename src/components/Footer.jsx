import { Link } from 'react-router-dom';
import { TruckIcon } from './Icons';

const tickerItems = [
  'Same-day dispatch',
  'Live order tracking',
  'Verified couriers',
  'Secure handover',
  '24/7 dispatch desk',
  'Transparent pricing',
];

const Footer = () => {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="bg-[#0a0a0b] text-neutral-400 border-t border-white/10">
      {/* Ticker */}
      <div className="marquee border-b border-white/10 bg-[#111113] py-3 select-none" aria-hidden="true">
        <div className="marquee-track text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-10">
              <span>{item}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">

          {/* Brand */}
          <div className="reveal">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[10px] bg-red-600 flex items-center justify-center text-white shadow-sm">
                <TruckIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-lg font-bold tracking-tight text-white leading-tight">
                  Delivery<span className="text-red-500">+</span>
                </span>
                <span className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.18em]">
                  Express Couriers
                </span>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm text-neutral-400 leading-relaxed">
              Fast, secure, and transparent local delivery. Direct connection between customers and verified couriers.
            </p>
            <div className="mt-5 inline-flex items-center gap-2.5 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs font-medium text-neutral-300">
              <span className="live-dot w-2 h-2 rounded-full bg-red-500" />
              Courier network active
              <span className="text-neutral-500">·</span>
              <span className="text-white font-semibold">~15 min pickup</span>
            </div>

            <div className="mt-6 flex items-center gap-2">
              {[
                { label: 'X', href: '/' },
                { label: 'IG', href: '/' },
                { label: 'IN', href: '/' },
              ].map((s) => (
                <Link
                  key={s.label}
                  to={s.href}
                  aria-label={s.label}
                  className="icon-btn w-9 h-9 rounded-md border border-white/10 bg-white/5 flex items-center justify-center text-[11px] font-bold text-neutral-300 hover:bg-white hover:text-black hover:border-white"
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div className="reveal reveal-2 text-sm">
            <p className="font-semibold text-white mb-4 text-[13px] uppercase tracking-[0.14em]">
              Company
            </p>
            <ul className="space-y-2.5">
              {[
                ['/', 'Home'],
                ['/dashboard', 'Dashboard'],
                ['/orders/new', 'Create delivery'],
                ['/riders/available', 'Available jobs'],
              ].map(([to, label]) => (
                <li key={label}>
                  <Link to={to} className="footer-link hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div className="reveal reveal-3 text-sm">
            <p className="font-semibold text-white mb-4 text-[13px] uppercase tracking-[0.14em]">
              Platform
            </p>
            <ul className="space-y-2.5">
              {[
                ['/dashboard', 'Track orders'],
                ['/riders/available', 'Become a courier'],
                ['/admin/users', 'Fleet overview'],
                ['/orders/new', 'Pricing'],
              ].map(([to, label]) => (
                <li key={label}>
                  <Link to={to} className="footer-link hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="reveal reveal-4 text-sm">
            <p className="font-semibold text-white mb-4 text-[13px] uppercase tracking-[0.14em]">
              Dispatch desk
            </p>
            <p className="text-neutral-400 leading-relaxed">
              Urgent delivery help, 24/7:
              <br />
              <a href="tel:+15551234567" className="footer-link text-white font-semibold mt-1 inline-block">
                +1 (555) 902-3354
              </a>
            </p>
            <Link
              to="/orders/new"
              className="btn-sleek mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-white text-black text-sm font-semibold hover:bg-red-600 hover:text-white"
            >
              Start a delivery
              <span className="btn-arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} Delivery+ Platform. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link to="/" className="footer-link hover:text-neutral-200">Terms</Link>
            <Link to="/" className="footer-link hover:text-neutral-200">Privacy</Link>
            <Link to="/" className="footer-link hover:text-neutral-200">Courier guidelines</Link>
            <button
              type="button"
              onClick={scrollTop}
              className="icon-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-white/10 bg-white/5 text-neutral-300 hover:bg-white hover:text-black"
            >
              Top <span aria-hidden="true">↑</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
