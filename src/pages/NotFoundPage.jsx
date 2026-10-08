const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-5xl font-bold text-primary-900 mb-6">404</h1>
      <p className="text-xl text-text-secondary mb-8">Page not found</p>
      <a href="/" className="text-white bg-secondary-600 hover:bg-secondary-700 focus:ring-4 focus:ring-secondary-300 font-medium rounded-lg text-sm px-5 py-2.5 transition duration-200">
        Go Home
      </a>
    </div>
  );
};

export default NotFoundPage;