import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Sun,
  Moon,
  LogOut,
  LayoutDashboard,
  Lightbulb,
  MessageSquare,
  BarChart3,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
      isActive
        ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800'
    }`;

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 gradient-bg rounded-lg shadow-lg group-hover:shadow-brand-500/50 transition-shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
              FeedbackPortal
            </span>
          </Link>

          {/* Nav Links (desktop) */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              <NavLink to="/dashboard" className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/features" className={navLinkClass}>
                <Lightbulb className="w-4 h-4" />
                <span>Features</span>
              </NavLink>
              <NavLink to="/feedback" className={navLinkClass}>
                <MessageSquare className="w-4 h-4" />
                <span>Feedback</span>
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={navLinkClass}>
                  <BarChart3 className="w-4 h-4" />
                  <span>Admin</span>
                </NavLink>
              )}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-dark-800 rounded-lg">
                  <UserIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.username}
                  </span>
                  {isAdmin && <span className="badge-purple">admin</span>}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        {user && (
          <div className="md:hidden flex overflow-x-auto gap-1 pb-3 -mx-1 px-1">
            <NavLink to="/dashboard" className={navLinkClass}>
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-xs">Dashboard</span>
            </NavLink>
            <NavLink to="/features" className={navLinkClass}>
              <Lightbulb className="w-4 h-4" />
              <span className="text-xs">Features</span>
            </NavLink>
            <NavLink to="/feedback" className={navLinkClass}>
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs">Feedback</span>
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={navLinkClass}>
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs">Admin</span>
              </NavLink>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
