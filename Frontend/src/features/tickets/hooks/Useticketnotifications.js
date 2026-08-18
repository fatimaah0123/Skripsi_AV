import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { ticketService } from '../services/ticketService';

const POLL_INTERVAL_MS = 30000; 
const seenKey = (userId) => `avatar_seen_ticket_ids_${userId || 'anon'}`;

const loadSeenIds = (userId) => {
  try {
    const raw = localStorage.getItem(seenKey(userId));
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};

const saveSeenIds = (userId, idsSet) => {
  try {
    localStorage.setItem(seenKey(userId), JSON.stringify(Array.from(idsSet)));
  } catch {
  }
};

const useTicketNotifications = () => {
  const { user, isAdmin } = useAuth();
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
  const [newAssignedTickets, setNewAssignedTickets]      = useState([]);
  const [pendingApprovalTickets, setPendingApprovalTickets] = useState([]);
  const seenIdsRef = useRef(loadSeenIds(user?.id));

  const refresh = useCallback(async () => {
    try {
      const tickets = await ticketService.getAllTickets();

      if (isAdmin) {
        const waiting = tickets.filter((t) => t.status === 'WaitingApproval');
        setPendingApprovalTickets(waiting);
        setPendingApprovalCount(waiting.length);
      } else {
        const assigned = tickets.filter((t) => t.status === 'Assigned');
        const unseen   = assigned.filter((t) => !seenIdsRef.current.has(String(t.id)));
        setNewAssignedTickets(unseen);
      }
    } catch {
    }
  }, [isAdmin]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

   const markAsSeen = useCallback((ticketIds) => {
    const ids = Array.isArray(ticketIds) ? ticketIds : [ticketIds];
    ids.forEach((id) => seenIdsRef.current.add(String(id)));
    saveSeenIds(user?.id, seenIdsRef.current);
    setNewAssignedTickets((prev) => prev.filter((t) => !seenIdsRef.current.has(String(t.id))));
  }, [user?.id]);

  const markAllAssignedAsSeen = useCallback(() => {
    markAsSeen(newAssignedTickets.map((t) => t.id));
  }, [markAsSeen, newAssignedTickets]);

  return {
    isAdmin,
    pendingApprovalCount,
    pendingApprovalTickets,
    newAssignedCount: newAssignedTickets.length,
    newAssignedTickets,
    markAsSeen,
    markAllAssignedAsSeen,
    badgeCount: isAdmin ? pendingApprovalCount : newAssignedTickets.length,
    refresh,
  };
};

export default useTicketNotifications;