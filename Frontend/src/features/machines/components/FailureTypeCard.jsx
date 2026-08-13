import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function FailureTypeCard({ failure, index }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold px-2.5 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg tracking-wide uppercase">
            {failure.code || `ERR-0${index + 1}`}
          </span>
          {failure.total_occurrences !== undefined && (
            <span className="text-xs text-slate-400 font-medium">
              {failure.total_occurrences}x Terjadi
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
          {failure.name || failure.type_name}
        </h3>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          {failure.description || 'Tidak ada deskripsi detail untuk tipe kerusakan ini.'}
        </p>
      </div>

      {failure.recommended_action && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-3 rounded-xl mt-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Rekomendasi Penanganan:
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
            {failure.recommended_action}
          </p>
        </div>
      )}
    </div>
  );
}