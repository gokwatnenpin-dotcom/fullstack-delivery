import { Link } from 'react-router-dom';
import { TruckIcon, PackageIcon, ShieldIcon, ClockIcon, ArrowRightIcon, PinIcon } from '../components/Icons';

const HomePage = () => {
  const token = localStorage.getItem('delivery-token');

  return (
    <main className="bg-[#f4f4f5] text-slate-900 pb-20">
      {/* Hero — solid black */}
      <section className="relative overflow-hidden bg-[#0a0a0b] text-white border-b border-black">
        {/* Decorative rings — solid borders only, no gradients */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full border border-white/10" aria-hidden="true" />
        <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full border border-white/10" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-80 w-80 rounded-full border border-white/10" aria-hidden="true" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-24">

          {/* Left Copy */}
          <div className="max-w-2xl">
            <div className="reveal inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-white/5 border border-white/10 text-neutral-300 text-xs font-semibold mb-6">
              <span className="live-dot w-2 h-2 rounded-full bg-red-500" />
              Reliable local courier platform
              <span className="text-neutral-600">·</span>
              <span className="text-white">Live now</span>
            </div>

            <h1 className="reveal reveal-1 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
              Send packages fast,
              <br />
              <span className="text-red-500">track in real-time.</span>
            </h1>

            <p className="reveal reveal-2 mt-5 text-base sm:text-lg text-neutral-400 max-w-xl leading-relaxed">
              Connect your business or personal deliveries directly with nearby riders. Instant dispatch, status notifications, and reliable door-to-door delivery.
            </p>

            <div className="reveal reveal-3 mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                to={token ? "/orders/new" : "/register"}
                className="btn-sleek inline-flex items-center gap-2 px-6 py-3 rounded-md bg-white hover:bg-red-600 hover:text-white text-black font-semibold text-sm shadow-sm transition"
              >
                {token ? "Create Delivery" : "Start Sending"}
                <ArrowRightIcon className="btn-arrow w-4 h-4" />
              </Link>

              <Link
                to={token ? "/dashboard" : "/login"}
                className="btn-sleek px-6 py-3 rounded-md bg-transparent hover:bg-white/10 text-white border border-white/20 font-semibold text-sm transition"
              >
                {token ? "Dashboard" : "Sign In"}
              </Link>
            </div>

            {/* Stats Bar */}
            <div className="reveal reveal-4 mt-12 pt-8 border-t border-white/10 grid grid-cols-3 gap-6 text-left">
              {[
                ['15m', 'Avg pickup time'],
                ['99.8%', 'Delivery success'],
                ['24/7', 'Active couriers'],
              ].map(([val, label]) => (
                <div key={label}>
                  <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{val}</div>
                  <div className="text-xs text-neutral-500 mt-1 uppercase tracking-wider font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right tracking card */}
          <div className="reveal reveal-2">
            <div className="float-slow rounded-2xl border border-white/10 bg-[#131315] p-6 sm:p-7 shadow-[0_32px_64px_-24px_rgba(0,0,0,0.9)]">
              <div className="flex items-center justify-between pb-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center">
                    <PackageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Delivery Order #4029</div>
                    <div className="text-xs text-neutral-400">Assigned courier: Sam O.</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-600/15 text-red-400 border border-red-600/30">
                  <span className="live-dot w-1.5 h-1.5 rounded-full bg-red-500" />
                  In transit
                </span>
              </div>

              {/* Animated route */}
              <div className="my-6">
                <div className="flex items-start gap-3">
                  <PinIcon className="w-4 h-4 text-red-500 mt-1 shrink-0" />
                  <div>
                    <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Pickup location</div>
                    <div className="text-sm font-medium text-white">Northgate Distribution Hub, Dock 4</div>
                  </div>
                </div>

                <div className="ml-[7px] my-1" aria-hidden="true">
                  <svg width="2" height="36" className="block">
                    <line x1="1" y1="0" x2="1" y2="36" stroke="#52525b" strokeWidth="2" className="route-line" />
                  </svg>
                </div>

                <div className="flex items-start gap-3">
                  <PinIcon className="w-4 h-4 text-neutral-500 mt-1 shrink-0" />
                  <div>
                    <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Dropoff point</div>
                    <div className="text-sm font-medium text-white">Maplewood Commercial Center, Suite 210</div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-center justify-between text-xs">
                <div>
                  <span className="text-neutral-500 block">Est. arrival</span>
                  <span className="text-white font-semibold text-sm">18 minutes</span>
                </div>
                <div className="h-8 w-px bg-white/10" aria-hidden="true" />
                <div>
                  <span className="text-neutral-500 block">Package</span>
                  <span className="text-white font-semibold text-sm">Electronics box</span>
                </div>
                <div className="h-8 w-px bg-white/10" aria-hidden="true" />
                <div>
                  <span className="text-neutral-500 block">Fee</span>
                  <span className="text-red-400 font-semibold text-sm">$32.50</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal text-center max-w-2xl mx-auto mb-12">
            <h2 className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-white uppercase mb-4 px-3.5 py-1.5 rounded-md bg-[#0a0a0b]">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Platform capabilities
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Everything you need for seamless delivery</p>
            <p className="mt-3 text-sm sm:text-base text-slate-500">Solid tooling, live updates, and a courier network that stays moving.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: <ClockIcon className="w-5 h-5" />, title: 'Instant dispatch', copy: 'Post an order and available couriers in the immediate area receive the assignment instantly.' },
              { icon: <ShieldIcon className="w-5 h-5" />, title: 'Status milestones', copy: 'Clear confirmation from pickup through road transit to recipient handover.' },
              { icon: <TruckIcon className="w-5 h-5" />, title: 'Courier network', copy: 'Couriers manage availability status and review pickup & dropoff coordinates with ease.' },
            ].map((f, i) => (
              <div key={f.title} className={`reveal reveal-${i + 1} card-lift rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm`}>
                <div className="w-11 h-11 rounded-xl bg-[#0a0a0b] text-white flex items-center justify-center mb-5">
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.copy}</p>
                <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-semibold">
                  <span className="text-neutral-400">0{i + 1}</span>
                  <Link to={token ? '/dashboard' : '/register'} className="footer-link text-black">
                    Learn more →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Black CTA band */}
          <div className="reveal reveal-3 mt-10 rounded-2xl bg-[#0a0a0b] text-white p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center gap-6 justify-between border border-black overflow-hidden relative">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full border border-white/10" aria-hidden="true" />
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full border border-white/10" aria-hidden="true" />
            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Ready when you are</p>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">Dispatch your first delivery in under a minute.</h3>
              <p className="mt-2 text-sm text-neutral-400">No setup fees. Live tracking included on every order.</p>
            </div>
            <div className="relative flex flex-wrap gap-3">
              <Link
                to={token ? '/orders/new' : '/register'}
                className="btn-sleek inline-flex items-center gap-2 px-6 py-3 rounded-md bg-white text-black font-semibold text-sm hover:bg-red-600 hover:text-white"
              >
                {token ? 'New delivery' : 'Create account'}
                <ArrowRightIcon className="btn-arrow w-4 h-4" />
              </Link>
              <Link
                to="/dashboard"
                className="btn-sleek px-6 py-3 rounded-md border border-white/20 text-sm font-semibold text-white hover:bg-white/10"
              >
                View demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
