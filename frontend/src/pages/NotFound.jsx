import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
    <div className="text-center animate-fade-in">
      <div className="inline-flex p-4 gradient-bg rounded-2xl mb-6 shadow-2xl">
        <AlertCircle className="w-12 h-12 text-white" />
      </div>
      <h1 className="text-7xl font-extrabold bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent mb-2">
        404
      </h1>
      <h2 className="text-2xl font-bold mb-2">Page not found</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link to="/" className="btn-primary inline-flex items-center gap-2">
        <Home className="w-4 h-4" /> Back to home
      </Link>
    </div>
  </div>
);

export default NotFound;
