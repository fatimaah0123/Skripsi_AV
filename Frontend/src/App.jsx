import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routes/AppRoutes';
import useDarkMode from './hooks/useDarkMode';

const App = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // 🟢 Panggil useDarkMode di sini sebagai sumber kebenaran utama
  const [isDark, toggleDark] = useDarkMode();

  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return <AppRoutes />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-stone-100 dark:bg-stone-950 font-sans text-stone-900 dark:text-stone-100 transition-colors duration-300">
      {/* Navbar Atas - Teruskan props isDark & toggleDark */}
      <Navbar
        isDark={isDark}
        toggleDark={toggleDark}
        onMenuClick={() => setIsSidebarOpen(true)}
      />

      {/* Sidebar Mobile */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Area Konten Utama */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AppRoutes />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;