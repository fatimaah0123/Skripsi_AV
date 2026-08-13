import React, { useState } from 'react';
import { Box, Plus, Search, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import MachineTable, { DeleteConfirmDialog } from '../components/MachineTable';
import MachineModal from '../components/MachineModal';
import MachineDetailModal from '../components/MachineDetailModal';
import useMachine from '../hooks/useMachine';

const MachineManagementPage = () => {
  const { isAdmin } = useAuth();
  const [selectedMachine, setSelectedMachine] = useState(null);

  const {
    machines,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    sortOrder,
    toggleSortOrder,
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
  } = useMachine();

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl text-white shadow-lg shadow-blue-500/20 shrink-0">
            <Box size={20} className="sm:w-[22px] sm:h-[22px]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white tracking-tight truncate">
              {isAdmin ? 'Manajemen Mesin' : 'Daftar Mesin'}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5 truncate">
              {isAdmin
                ? 'Pantau dan kelola aset teknis AVATAR'
                : 'Pantau status dan kondisi aset mesin AVATAR'}
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 w-full sm:w-auto shrink-0"
          >
            <Plus size={18} />
            Tambah Mesin
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
          <input
            type="text"
            placeholder="Cari nama atau kode mesin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all shadow-sm"
          >
            <option value="name">Urutkan: Nama</option>
            <option value="criticality">Urutkan: Status</option>
            <option value="install_date">Urutkan: Tanggal Instalasi</option>
          </select>
          <button
            onClick={toggleSortOrder}
            title={sortOrder === 'asc' ? 'Urutan naik (A-Z)' : 'Urutan turun (Z-A)'}
            className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-500 hover:text-blue-600 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm"
          >
            {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-40 sm:h-48 gap-3 text-stone-400">
          <RefreshCw size={18} className="animate-spin" />
          <span className="text-sm">Memuat data mesin...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <MachineTable
          machines={machines}
          onEdit={openEditModal}
          onDeleteClick={setDeleteTarget}
          onSelectMachine={(machine) => setSelectedMachine(machine)}
        />
      )}

      <MachineDetailModal
        machine={selectedMachine}
        onClose={() => setSelectedMachine(null)}
      />

      <MachineModal
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
        machine={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default MachineManagementPage;