import React, { useState } from 'react';
import { X, Save, Mail, ShieldCheck, Loader2, Eye, EyeOff, Hash, User } from 'lucide-react';

const UserModal = ({
  isModalOpen,
  editTarget,
  formData,
  formError,
  isSubmitting,
  closeModal,
  handleChange,
  handleSubmit,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  if (!isModalOpen) return null;

  const isEdit = !!editTarget;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-md">
      <div className="bg-white dark:bg-stone-900 w-full sm:max-w-lg max-h-[92vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-stone-200 dark:border-stone-800 flex flex-col">
        <div className="p-4 sm:p-6 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 rounded-lg shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight truncate">
                {isEdit ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
              {isEdit && (
                <p className="text-xs text-stone-400 mt-0.5 truncate">
                  {editTarget.employee_id} · {editTarget.email}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors shrink-0"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto grow">
          {formError && (
            <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {formError}
            </div>
          )}

          {!isEdit && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Employee ID
                </label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    name="employee_id"
                    required
                    placeholder="EMP-001"
                    value={formData.employee_id}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 dark:bg-stone-800 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="nama@avatar.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 dark:bg-stone-800 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all"
                  />
                </div>
              </div>
            </>
          )}

          {isEdit && (
            <div className="px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400">
              Employee ID dan email tidak dapat diubah di sini.
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                name="name"
                required
                placeholder="Nama lengkap pengguna..."
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 dark:bg-stone-800 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Password
              {isEdit && (
                <span className="normal-case text-stone-400 font-normal"> (kosongkan jika tidak ingin mengubah)</span>
              )}
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                required={!isEdit}
                minLength={isEdit ? undefined : 8}
                placeholder={isEdit ? 'Password baru (opsional)' : 'Minimal 8 karakter'}
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 pr-12 py-3 rounded-xl border border-stone-200 dark:border-stone-800 dark:bg-stone-800 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {!isEdit && (
              <p className="text-[11px] text-stone-400 mt-1.5">Password minimal 8 karakter.</p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 dark:bg-stone-800 dark:text-white font-bold text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all appearance-none"
            >
              <option value="Engineer">Engineer</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 pb-1">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 px-6 py-3 border border-stone-200 dark:border-stone-700 rounded-xl font-bold text-gray-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" /><span>Menyimpan...</span></>
              ) : (
                <><Save size={16} /><span>{isEdit ? 'Simpan Perubahan' : 'Tambah Pengguna'}</span></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;