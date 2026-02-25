import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLanding = location.pathname === '/';
  const isEditor = location.pathname.startsWith('/editor');
  const isPublished = location.pathname.startsWith('/site');

  if (isEditor || isPublished) return null;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isLanding ? 'bg-white/80 backdrop-blur-lg border-b border-gray-100' : 'bg-white shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              InviteCraft
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors font-medium"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Мои сайты
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{user?.name}</span>
                </div>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
                >
                  Войти
                </Link>
                <Link
                  to="/auth?mode=register"
                  className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-200 transition-all hover:-translate-y-0.5"
                >
                  Создать бесплатно
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-600"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-slide-down">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2 py-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{user?.name}</span>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block px-2 py-2 text-gray-600 hover:text-indigo-600 font-medium"
                >
                  Мои сайты
                </Link>
                <button
                  onClick={() => { logout(); navigate('/'); setMobileOpen(false); }}
                  className="block px-2 py-2 text-gray-400 hover:text-red-500 text-sm"
                >
                  Выйти
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="block px-2 py-2 text-gray-600 hover:text-indigo-600 font-medium"
                >
                  Войти
                </Link>
                <Link
                  to="/auth?mode=register"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium text-center"
                >
                  Создать бесплатно
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
