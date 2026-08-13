import React from 'react';
import { X, Cpu, Save, Loader2 } from 'lucide-react';

const InputField = ({ label, name, value, onChange, type = 'text', placeholder, required = true }) => (
  <div>
    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
      {label}
    </label>
    <input
      type={type}
      name={name}
      required={required}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 dark:bg-stone-800 dark:text-white font-medium text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
    />
  </div>
);

const MachineModal = ({
  isModalOpen,
  editTarget,
  formData,
  formError,
  isSubmitting,
  closeModal,
  handleChange,
  handleSubmit,
}) => {
  if (!isModalOpen) return null;

  const isEdit = !!editTarget;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-md">
      <div className="bg-white dark:bg-stone-900 w-full sm:max-w-xl max-h-[92vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-stone-200 dark:border-stone-800 flex flex-col">
        <div className="p-4 sm:p-6 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg shrink-0">
              <Cpu size={20} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight truncate">
              {isEdit ? 'Edit Data Mesin' : 'Tambah Mesin Baru'}
            </h3>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Kode Mesin"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="MCH-001"
            />
            <InputField
              label="Tipe Mesin"
              name="type"
              value={formData.type}
              onChange={handleChange}
              placeholder="Lathe / Milling / dll"
            />
          </div>

          <InputField
            label="Nama Mesin"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Mesin Bubut A1"
          />

          <InputField
            label="Lokasi"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Lantai 1 - Area A"
          />

          <InputField
            label="Tanggal Instalasi"
            name="install_date"
            type="date"
            value={formData.install_date}
            onChange={handleChange}
            placeholder=""
          />

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 pb-1">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 px-6 py-3 border border-stone-200 dark:border-stone-700 rounded-xl font-bold text-gray-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{isEdit ? 'Simpan Perubahan' : 'Tambah Mesin'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MachineModal;