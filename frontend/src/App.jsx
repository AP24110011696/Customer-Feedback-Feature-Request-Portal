import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Features from './pages/Features';
import FeatureDetail from './pages/FeatureDetail';
import Feedback from './pages/Feedback';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/features"
            element={
              <ProtectedRoute>
                <Features />
              </ProtectedRoute>
            }
          />
          <Route
            path="/features/:id"
            element={
              <ProtectedRoute>
                <FeatureDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <ProtectedRoute>
                <Feedback />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="border-t border-gray-200 dark:border-dark-800 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Built with ❤️ using MERN · Socket.io · Tailwind ·{' '}
          <a
            href="https://github.com/NithinReddy282308"
            className="hover:text-brand-500"
            target="_blank"
            rel="noreferrer"
          >
            @NithinReddy282308
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
