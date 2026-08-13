import React from 'react';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { useLogin } from '../hooks/useLogin';

const LoginForm = () => {
  const {
    email, setEmail,
    password, setPassword,
    showPassword, setShowPassword,
    error,
    isLoading,
    handleLogin,
  } = useLogin();

  return (
    // 📌 PASTI KAN onSubmit dipasang di tag <form>
    <form onSubmit={handleLogin} className="space-y-5">
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-blue-100">Email</label>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@perusahaan.com"
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-400/60 transition"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-blue-100">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-400/60 transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition"
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* 📌 PASTIKAN button bertipe type="submit" */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-blue-500 hover:bg-blue-400 active:scale-[0.98] text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Memproses...</span>
          </>
        ) : (
          <>
            <LogIn size={18} />
            <span>Masuk</span>
          </>
        )}
      </button>
    </form>
  );
};

export default LoginForm;