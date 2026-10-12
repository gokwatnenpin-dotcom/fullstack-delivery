import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#090a0f] py-20 px-4 flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#11131a] p-8 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center text-xl font-bold mb-4">
          404
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Page Not Found
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          The link or route you followed doesn't exist on this delivery network.
        </p>

        <div className="mt-6">
          <Link
            to="/"
            className="inline-block px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs tracking-wider uppercase shadow-md transition"
          >
            ← Return Home
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFoundPage;