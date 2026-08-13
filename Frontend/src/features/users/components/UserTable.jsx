import React from 'react';
import { Pencil, Trash2, AlertTriangle, Mail } from 'lucide-react';

const RoleBadge = ({ role }) => {
  const isAdmin = role === 'Admin';
  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${
      isAdmin
        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/50'
        : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50'
    }`}>
      {role}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  if (!status) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-stone-400 dark:text-stone-500 whitespace-nowrap">
        <div className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-600" />
        Belum diatur
      </div>
    );
  }
  const isActive = status === 'Active';
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
      isActive ? 'text-green-600 dark:text-green-400' : 'text-cyan-600 dark:text-cyan-400'
    }`}>
      <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-cyan-500 animate-pulse'}`} />
      {status === 'Onduty' ? 'On Duty' : status}
    </div>
  );
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

export const DeleteConfirmDialog = ({ user, onConfirm, onCancel }) => {
  if (!user) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div>
            <h4 className="font-bold text-stone-900 dark:text-white">Hapus Pengguna?</h4>
            <p className="text-xs text-stone-500 mt-0.5">Tindakan ini tidak dapat dibatalkan</p>
          </div>
        </div>
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-6 break-words">
          Anda akan menghapus akun <span className="font-bold text-stone-900 dark:text-white">"{user.name}"</span> ({user.employee_id}).
        </p>
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl font-bold text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all text-sm"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(user.id)}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all text-sm"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

// Kartu untuk layar kecil (< sm), menggantikan tabel yang terlalu sempit
const UserCard = ({ user, onEdit, onDeleteClick }) => (
  <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 p-4">
    <div className="flex items-start gap-3">
      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-cyan-100 to-blue-50 dark:from-cyan-900/40 dark:to-blue-900/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold text-sm border border-cyan-200 dark:border-cyan-800 shrink-0">
        {user.name?.charAt(0)?.toUpperCase() || '?'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs font-bold text-cyan-500 mb-0.5">{user.employee_id}</div>
            <div className="text-sm font-semibold text-stone-800 dark:text-stone-200 leading-tight truncate">
              {user.name}
            </div>
          </div>
          <RoleBadge role={user.role} />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-1 min-w-0">
          <Mail size={12} className="shrink-0" />
          <span className="truncate">{user.email}</span>
        </div>
      </div>
    </div>

    <div className="mt-3 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
      <StatusBadge status={user.status} />
      <span>Terdaftar {formatDate(user.created_at)}</span>
    </div>

    <div className="mt-4 flex items-center gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
      <button
        onClick={() => onEdit(user)}
        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all text-xs font-bold"
      >
        <Pencil size={14} />
        Edit
      </button>
      <button
        onClick={() => onDeleteClick(user)}
        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all text-xs font-bold"
      >
        <Trash2 size={14} />
        Hapus
      </button>
    </div>
  </div>
);

const UserTable = ({ users = [], onEdit, onDeleteClick }) => {
  if (users.length === 0) {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 p-10 sm:p-16 text-center">
        <p className="text-stone-400 text-sm">Tidak ada data pengguna ditemukan.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: kartu (< sm) */}
      <div className="grid grid-cols-1 gap-3 sm:hidden">
        {users.map((user) => (
          <UserCard key={user.id} user={user} onEdit={onEdit} onDeleteClick={onDeleteClick} />
        ))}
      </div>

      {/* Tablet/desktop: tabel (sm ke atas) */}
      <div className="hidden sm:block bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[680px]">
            <thead>
              <tr className="bg-stone-50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800">
                {['Informasi Personel', 'Role', 'Status', 'Terdaftar'].map((h, i) => (
                  <th key={i} className="px-4 lg:px-6 py-4 text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest">{h}</th>
                ))}
                <th className="px-4 lg:px-6 py-4 text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-cyan-50/30 dark:hover:bg-cyan-900/10 transition-colors group">
                  <td className="px-4 lg:px-6 py-4 max-w-[240px]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-100 to-blue-50 dark:from-cyan-900/40 dark:to-blue-900/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold text-sm border border-cyan-200 dark:border-cyan-800 shrink-0">
                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-cyan-500 mb-0.5">{user.employee_id}</div>
                        <div className="text-sm font-semibold text-stone-800 dark:text-stone-200 leading-tight truncate">{user.name}</div>
                        <div className="text-xs text-stone-400 truncate">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4"><RoleBadge role={user.role} /></td>
                  <td className="px-4 lg:px-6 py-4"><StatusBadge status={user.status} /></td>
                  <td className="px-4 lg:px-6 py-4 text-xs text-stone-500 dark:text-stone-400 whitespace-nowrap">{formatDate(user.created_at)}</td>
                  <td className="px-4 lg:px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(user)}
                        className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                        title="Edit pengguna"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteClick(user)}
                        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        title="Hapus pengguna"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default UserTable;