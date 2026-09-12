import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUser, logout } from '../services/authService';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const user = getUser();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goTo = (path) => {
    setOpen(false);
    navigate(path);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between">

          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="text-2xl font-bold text-blue-600"
          >
            Knowly
          </button>

          {/* Navigation */}
          <div className="flex items-center gap-5">

            <button
              onClick={() => navigate('/')}
              className={`text-sm font-medium transition ${
                isActive('/')
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => navigate('/skills')}
              className={`text-sm font-medium transition ${
                isActive('/skills')
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Skills
            </button>

            <button
              onClick={() => navigate('/workshops')}
              className={`text-sm font-medium transition ${
                location.pathname.startsWith('/workshops')
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Workshops
            </button>

            <NotificationBell />

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>

              <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
              >
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>

                <span className="hidden sm:inline">
                  {user?.name || 'Account'}
                </span>

                <span className="text-xs">
                  {open ? '▲' : '▼'}
                </span>
              </button>

              {open && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">

                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-900">
                      {user?.name || 'User'}
                    </p>

                    <p className="text-xs text-gray-500 mt-1 break-all">
                      {user?.email || ''}
                    </p>
                  </div>

                  <button
                    onClick={() => goTo('/profile')}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    Logout
                  </button>

                </div>
              )}

            </div>

          </div>
        </div>
      </div>
    </nav>
  );
}