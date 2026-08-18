import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Bell, FileCheck, Ticket } from 'lucide-react';
import useTicketNotifications from '../hooks/useTicketNotifications';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const NotificationBell = ({ variant = 'light' }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const buttonRef   = useRef(null);

  const {
    isAdmin,
    pendingApprovalTickets,
    newAssignedTickets,
    badgeCount,
    markAllAssignedAsSeen,
    markAsSeen,
  } = useTicketNotifications();

  const items = isAdmin ? pendingApprovalTickets : newAssignedTickets;

  const bellButtonClass = variant === 'dark'
    ? 'relative p-2.5 rounded-full hover:bg-white/20 transition-all duration-300 text-white focus:outline-none cursor-pointer'
    : 'relative p-2 rounded-xl text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer';

  const updateCoords = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setCoords({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updateCoords();
    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords, true);
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [isOpen, updateCoords]);

  const menuRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      const clickedButton = buttonRef.current && buttonRef.current.contains(e.target);
      const clickedMenu    = menuRef.current && menuRef.current.contains(e.target);
      if (!clickedButton && !clickedMenu) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    // Teknisi: begitu dropdown dibuka, anggap semua notif "dilihat"
    if (next && !isAdmin) markAllAssignedAsSeen();
  };

  const handleItemClick = (ticket) => {
    if (!isAdmin) markAsSeen(ticket.id);
    setIsOpen(false);
    navigate(`/tickets/${ticket.id}`);
  };

  return (
    <div className="relative" ref={buttonRef}>
      <button
        onClick={handleToggle}
        className={bellButtonClass}
        aria-label="Notifikasi"
      >
        <Bell size={20} className={variant === 'dark' ? 'text-blue-100' : ''} />
        {badgeCount > 0 && (
          <span className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-orange-500 text-white text-[10px] font-black animate-pulse ${
            variant === 'dark' ? 'border-2 border-blue-950' : 'border-2 border-white dark:border-stone-950'
          }`}>
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
      </button>

      {isOpen && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: coords.top, right: coords.right }}
          className="w-80 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl z-[9999] overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
            <h4 className="text-sm font-bold text-stone-900 dark:text-white">
              {isAdmin ? 'Menunggu Approval' : 'Tiket Baru Ditugaskan'}
            </h4>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-8 px-4">
                {isAdmin ? 'Tidak ada tiket yang menunggu approval.' : 'Tidak ada tiket baru untuk Anda.'}
              </p>
            ) : (
              items.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => handleItemClick(ticket)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/60 border-b border-stone-50 dark:border-stone-800/60 last:border-0 text-left transition-colors cursor-pointer"
                >
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                    isAdmin ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                            : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                  }`}>
                    {isAdmin ? <FileCheck size={14} /> : <Ticket size={14} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-stone-900 dark:text-white truncate">
                      #{ticket.id} · {ticket.machine_name}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      {isAdmin ? 'Laporan menunggu persetujuan Anda' : 'Baru saja ditugaskan kepada Anda'}
                    </p>
                    <p className="text-[10px] text-stone-400 mt-0.5">{formatDate(ticket.created_at)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default NotificationBell;