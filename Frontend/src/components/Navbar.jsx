import React from 'react';
import {
  Menu, Sun, Moon,
  LayoutDashboard, Ticket, MessageSquare,
  UserCircle, Activity, Clock, LogOut
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../features/tickets/components/NotificationBell';

const ThemeToggle = ({ isDark, toggle }) => (
  <button
    type="button"
    onClick={toggle}
    className="p-2.5 rounded-full hover:bg-white/20 transition-all duration-300 text-white focus:outline-none"
    title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    aria-label="Toggle theme"
  >
    {isDark ? (
      <Sun className="w-5 h-5 text-yellow-400 animate-pulse" />
    ) : (
      <Moon className="w-5 h-5 text-blue-100" />
    )}
  </button>
);

const ALL_NAV_LINKS = [
  { title: 'Dashboard',          path: '/dashboard',           icon: <LayoutDashboard size={18} />, adminOnly: false },
  { title: 'Tiket',              path: '/tickets',             icon: <Ticket size={18} />,          adminOnly: false },
  { title: 'AI Copilot',         path: '/chatbot',             icon: <MessageSquare size={18} />,   adminOnly: false },
  { title: 'Riwayat',            path: '/maintenance-history', icon: <Clock size={18} />,           adminOnly: true  },
  { title: 'Manajemen Mesin',    path: '/machines',            icon: <Activity size={18} />,        adminOnly: false },
  { title: 'Manajemen Pengguna', path: '/users',               icon: <UserCircle size={18} />,      adminOnly: true  },
];

const Navbar = ({ isDark, toggleDark, onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin: contextIsAdmin, logout } = useAuth();

  // Pengecekan status Admin secara fleksibel
  const isAdmin = contextIsAdmin ?? (user?.role?.toLowerCase() === 'admin');

  // Menyaring menu berdasarkan role pengguna
  const navLinks = ALL_NAV_LINKS.filter(link => !link.adminOnly || isAdmin);

  const isActive = (path) =>
    path === '/dashboard'
      ? location.pathname === '/' || location.pathname === '/dashboard'
      : location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="sticky top-0 z-30 w-full shadow-lg">
      {/* Top Bar Header */}
      <div className="relative h-20 overflow-hidden bg-gradient-to-r from-blue-900 via-blue-950 to-black border-b border-white/10 transition-all duration-500">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1513828583688-c52646db42da?q=80&w=1470&auto=format&fit=crop')` }}
        />

        <div className="relative max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors lg:hidden text-white border border-white/20"
              aria-label="Buka menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <Activity size={28} className="text-blue-400 mt-1" />
              <div className="flex flex-col text-white">
                <h1 className="text-2xl font-black tracking-tighter leading-none italic">AVATAR</h1>
                <p className="text-[8px] uppercase tracking-[0.3em] font-bold mt-1 text-blue-200/80">
                  Technical Analysis & Reliability
                </p>
              </div>
            </div>
          </div>

          {/* Kontrol Kanan: Dark Mode + User Info + Logout */}
          <div className="flex items-center gap-2 lg:gap-4">
            <NotificationBell variant="dark" />
            <ThemeToggle isDark={isDark} toggle={toggleDark} />

            <div className="flex items-center gap-3 border-l border-white/20 pl-4 lg:pl-6 text-white">
              <div className="shrink-0 w-10 h-10 rounded-full border-2 border-white/30 overflow-hidden bg-white/10 backdrop-blur-md flex items-center justify-center">
                <UserCircle size={26} className="text-white" />
              </div>
              {user && (
                <div className="hidden md:block">
                  <p className="text-xs font-bold leading-none uppercase tracking-wide">{user.name}</p>
                  <p className="text-[10px] text-blue-300 font-semibold mt-0.5">{user.role}</p>
                </div>
              )}
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-full hover:bg-white/20 transition-colors text-white/70 hover:text-red-300"
                aria-label="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links Bar */}
      <div className="bg-white/95 dark:bg-stone-950/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 hidden lg:block transition-all duration-500">
        <div className="max-w-7xl mx-auto px-6 flex items-center h-14 overflow-x-auto custom-scrollbar">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-5 py-4 text-sm font-bold flex items-center gap-2 transition-all relative shrink-0 ${
                isActive(link.path)
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-stone-500 dark:text-stone-400 hover:text-blue-600 dark:hover:text-white'
              }`}
            >
              {link.icon}
              {link.title}
              {isActive(link.path) && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 dark:bg-blue-500 rounded-t shadow-[0_-2px_10px_rgba(37,99,235,0.4)]" />
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;