import React from 'react';
import {
  LayoutDashboard, Ticket, X,
  Activity, MessageSquare, UserCircle, Clock, LogOut,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useTicketNotifications from '../features/tickets/hooks/useTicketNotifications';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isAdmin, user, logout } = useAuth();
  const { badgeCount } = useTicketNotifications();

  const isActive = (path) =>
    path === '/dashboard'
      ? location.pathname === '/' || location.pathname === '/dashboard'
      : location.pathname === path;

  const go = (path) => { navigate(path); onClose(); };

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { title: 'Dashboard',  icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { title: 'Tiket',      icon: <Ticket size={20} />,          path: '/tickets'   },
    { title: 'AI Copilot', icon: <MessageSquare size={20} />,   path: '/chatbot'   },
  ];

  const adminItems = [
    { title: 'Manajemen Mesin',    icon: <Activity size={20} />,    path: '/machines'            },
    { title: 'Manajemen Pengguna', icon: <UserCircle size={20} />,  path: '/users'               },
    { title: 'Riwayat',            icon: <Clock size={20} />,       path: '/maintenance-history' },
  ];

  const btnClass = (path) =>
    `w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
      isActive(path)
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
        : 'text-gray-600 dark:text-stone-400 hover:bg-blue-50 dark:hover:bg-stone-800 hover:text-blue-600 dark:hover:text-blue-400'
    }`;

  const iconClass = (path) => isActive(path) ? 'text-white' : 'text-gray-400 dark:text-stone-500';

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-white dark:bg-stone-900 shadow-2xl z-50
        flex flex-col transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 bg-gradient-to-br from-blue-900 via-blue-950 to-black flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <Activity size={24} className="text-blue-400" />
            <div className="flex flex-col">
              <span className="text-xl font-black italic tracking-tighter text-white">AVATAR</span>
              <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-blue-200/80 mt-1">
                Technical Analysis & Reliability
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {user && (
          <div className="px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-800">
            <p className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate">{user.name}</p>
            <p className="text-[10px] text-blue-500 font-semibold mt-0.5">{user.role}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 bg-stone-50/50 dark:bg-transparent">
          {menuItems.map((item) => (
            <button key={item.path} onClick={() => go(item.path)} className={btnClass(item.path)}>
              <span className={iconClass(item.path)}>{item.icon}</span>
              {item.title}
              {item.path === '/tickets' && badgeCount > 0 && (
                <span className="ml-auto min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-orange-500 text-white text-[10px] font-black animate-pulse">
                  {badgeCount > 9 ? '9+' : badgeCount}
                </span>
              )}
            </button>
          ))}

          {isAdmin && (
            <>
              <div className="pt-3 pb-1 px-2">
                <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 dark:text-stone-600">
                  Admin
                </p>
              </div>
              {adminItems.map((item) => (
                <button key={item.path} onClick={() => go(item.path)} className={btnClass(item.path)}>
                  <span className={iconClass(item.path)}>{item.icon}</span>
                  {item.title}
                </button>
              ))}
            </>
          )}
        </div>

        <div className="p-4 border-t border-stone-200 dark:border-stone-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;