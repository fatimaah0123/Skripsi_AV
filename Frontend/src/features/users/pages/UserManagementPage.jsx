import React from 'react';
import { Users, UserPlus, Search, RefreshCw } from 'lucide-react';
import UserTable, { DeleteConfirmDialog } from '../components/UserTable';
import UserModal from '../components/UserModal';
import useUsers from '../hooks/useUsers';

const UserManagementPage = () => {
  const {
    users,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    editTarget,
    formData,
    formError,
    isSubmitting,
    openAddModal,
    openEditModal,
    closeModal,
    handleChange,
    handleSubmit,
    deleteTarget,
    setDeleteTarget,
    handleDelete,
  } = useUsers();

  const totalAdmin    = users.filter((u) => u.role === 'Admin').length;
  const totalEngineer = users.filter((u) => u.role === 'Engineer').length;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="p-2.5 sm:p-3 bg-gradient-to-br from-cyan-600 to-blue-500 rounded-2xl text-white shadow-lg shadow-cyan-500/20 shrink-0">
            <Users size={20} className="sm:w-[22px] sm:h-[22px]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white tracking-tight truncate">
              Manajemen Pengguna
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5 truncate">
              Kelola akses dan akun seluruh pengguna sistem
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 w-full sm:w-auto shrink-0"
        >
          <UserPlus size={18} />
          Tambah Pengguna
        </button>
      </div>

      {!isLoading && !error && (
        <div className="flex flex-wrap gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Total</span>
            <span className="text-base font-black text-stone-800 dark:text-white">{users.length}</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/40 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Admin</span>
            <span className="text-base font-black text-purple-600 dark:text-purple-400">{totalAdmin}</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Engineer</span>
            <span className="text-base font-black text-blue-600 dark:text-blue-400">{totalEngineer}</span>
          </div>
        </div>
      )}

      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
        <input
          type="text"
          placeholder="Cari nama atau email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all shadow-sm"
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-40 sm:h-48 gap-3 text-stone-400">
          <RefreshCw size={18} className="animate-spin" />
          <span className="text-sm">Memuat data pengguna...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <UserTable
          users={users}
          onEdit={openEditModal}
          onDeleteClick={setDeleteTarget}
        />
      )}

      <UserModal
        isModalOpen={isModalOpen}
        editTarget={editTarget}
        formData={formData}
        formError={formError}
        isSubmitting={isSubmitting}
        closeModal={closeModal}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />

      <DeleteConfirmDialog
        user={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default UserManagementPage;