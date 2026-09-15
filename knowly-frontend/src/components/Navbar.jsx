import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUser, logout } from '../services/authService';
import NotificationBell from './NotificationBell';

const NAV_LINKS = [
  { path: '/', label: 'Home', match: (pathname) => pathname === '/' },
  { path: '/skills', label: 'Skills', match: (pathname) => pathname === '/skills' },
  { path: '/workshops', label: 'Workshops', match: (pathname) => pathname.startsWith('/workshops') },
  { path: '/my-interests', label: 'My Interests', match: (pathname) => pathname === '/my-interests' },
  { path: '/workshop-history', label: 'Workshop History', match: (pathname) => pathname === '/workshop-history' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const user = getUser();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const goTo = (path) => { setOpen(false); setMobileMenuOpen(false); navigate(path); };

  return (
    <nav className="bg-white border-b border-gray-200 relative z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between gap-3">
          <button onClick={() => goTo('/')} className="text-2xl font-bold text-blue-600 shrink-0">Knowly</button>
          <div className="hidden md:flex items-center gap-5">
            {NAV_LINKS.map((link) => (
              <button key={link.path} onClick={() => goTo(link.path)} className={`text-sm font-medium transition whitespace-nowrap ${link.match(location.pathname) ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>{link.label}</button>
            ))}
            <button onClick={() => goTo('/room')} className={`text-sm font-semibold transition whitespace-nowrap ${location.pathname === '/room' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>Room</button>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <NotificationBell />
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setOpen((prev) => !prev)} className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold shrink-0">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                <span className="hidden lg:inline">{user?.name || 'Account'}</span>
                <span className="text-xs hidden sm:inline">{open ? '▲' : '▼'}</span>
              </button>
              {open && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100"><p className="font-semibold text-gray-900">{user?.name || 'User'}</p><p className="text-xs text-gray-500 mt-1 break-all">{user?.email || ''}</p></div>
                  <button onClick={() => goTo('/profile')} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">Profile</button>
                  <button onClick={() => goTo('/room')} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">Room</button>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition">Logout</button>
                </div>
              )}
            </div>
            <button onClick={() => setMobileMenuOpen((prev) => !prev)} className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition" aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileMenuOpen}>
              {mobileMenuOpen ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => <button key={link.path} onClick={() => goTo(link.path)} className={`text-left px-2 py-2.5 rounded-lg text-sm font-medium transition ${link.match(location.pathname) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}>{link.label}</button>)}
            <button onClick={() => goTo('/room')} className="text-left px-2 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-blue-600">Room</button>
          </div>
        )}
      </div>
    </nav>
  );
}
