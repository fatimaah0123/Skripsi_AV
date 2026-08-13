import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import Feature Pages
import LoginPage from '../features/auth/pages/LoginPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import MachineManagementPage from '../features/machines/pages/MachineManagementPage';
import TicketsPage from '../features/tickets/pages/TicketsPage';
import TicketDetailPage from '../features/tickets/pages/TicketDetailPage';
import MaintenanceHistory from '../features/tickets/pages/MaintenanceHistory';
import UserManagementPage from '../features/users/pages/UserManagementPage';
import ChatbotPage from '../features/chatbot/pages/ChatbotPage';

// Sub-komponen Proteksi Rute Login
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900 text-white text-sm">
        Memverifikasi sesi...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rute Publik */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rute Terproteksi (Wajib Login) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/machines"
        element={
          <ProtectedRoute>
            <MachineManagementPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <TicketsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tickets/:id"
        element={
          <ProtectedRoute>
            <TicketDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/maintenance-history"
        element={
          <ProtectedRoute>
            <MaintenanceHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chatbot"
        element={
          <ProtectedRoute>
            <ChatbotPage />
          </ProtectedRoute>
        }
      />

      {/* Rute Khusus Admin */}
      <Route
        path="/users"
        element={
          <ProtectedRoute adminOnly>
            <UserManagementPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;