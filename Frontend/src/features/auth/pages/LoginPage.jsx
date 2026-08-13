import React from 'react';
import LoginBranding from '../components/LoginBranding';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-blue-950 font-sans">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1470&auto=format&fit=crop')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/95 via-blue-900/80 to-blue-950/90 shadow-inner" />
      </div>

      <div className="relative z-10 w-full max-w-6xl px-6 grid lg:grid-cols-2 gap-12 items-center">
        <LoginBranding />

        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight italic">
                Login
              </h2>
              <p className="text-blue-300 text-sm">Masuk ke sistem AVATAR</p>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-yellow-500 to-blue-600 shadow-[0_-4px_20px_rgba(37,99,235,0.4)]" />
    </div>
  );
};

export default LoginPage;