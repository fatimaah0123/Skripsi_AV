import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Camera, Upload, Loader2, Trash2, StopCircle, UserCheck, AlertCircle, CheckCircle2, Clock, FileText } from 'lucide-react';
import { ticketService } from '../services/ticketService';
import useCamera from '../hooks/useCamera';
import { useAuth } from '../../../context/AuthContext';


const AccentField = ({ color, icon: Icon, label, required, children }) => (
  <div className={`rounded-xl border border-stone-200 dark:border-stone-800 border-l-4 border-l-${color}-400 bg-${color}-50/50 dark:bg-${color}-900/10 p-3.5`}>
    <label className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mb-2 text-${color}-700 dark:text-${color}-400`}>
      <Icon size={13} />
      {label} {required && <span className="text-red-500 normal-case">*</span>}
    </label>
    {children}
  </div>
);

const SubmitReportModal = ({ ticket, report, onSuccess, onClose }) => {
  const { user } = useAuth();
  const teamLeaderName = user?.name || user?.full_name || '';

  // Konversi duration_hours (desimal, mis. 1.75) dari laporan lama menjadi Jam & Menit
  const initialDuration = Number(report?.duration_hours) || 0;
  const initHours = Math.floor(initialDuration);
  const initMinutes = Math.round((initialDuration - initHours) * 60);

  const [form, setForm] = useState({
    description: report?.description || '',
    action_taken: report?.action_taken || '',
    notes: report?.notes || '',
    duration_h: report ? String(initHours) : '',
    duration_m: report ? String(initMinutes) : '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const errorRef = useRef(null);

  const {
    isCameraOpen, devices, selectedDevice, setSelectedDevice,
    image, setImage, videoRef, canvasRef,
    startCamera, stopCamera, takePicture, resetImage,
  } = useCamera();

  useEffect(() => () => stopCamera(), [stopCamera]);

  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [error]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // Handler khusus Jam & Menit: hanya angka bulat, menit dibatasi maksimal 59
  const handleDurationChange = (e) => {
    const { name, value } = e.target;
    let v = value.replace(/[^0-9]/g, '');

    if (name === 'duration_m') {
      if (v !== '' && Number(v) > 59) v = '59';
    }
    setForm((p) => ({ ...p, [name]: v }));
  };

  // Gabungkan Jam + Menit menjadi desimal (mis. 2 jam 30 menit -> 2.5) untuk dikirim ke backend
  const getDurationHoursDecimal = () => {
    const h = Number(form.duration_h) || 0;
    const m = Number(form.duration_m) || 0;
    return h + m / 60;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const base64ToFile = (base64, filename = 'bukti.jpg') => {
    if (!base64) return null;
    let mime = 'image/jpeg';
    let bstr = '';

    if (base64.includes(',')) {
      const arr = base64.split(',');
      const match = arr[0].match(/:(.*?);/);
      if (match) mime = match[1];
      bstr = atob(arr[1]);
    } else {
      bstr = atob(base64);
    }

    let n = bstr.length;
    const u8 = new Uint8Array(n);
    while (n--) u8[n] = bstr.charCodeAt(n);
    return new File([u8], filename, { type: mime });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      setError('Foto bukti pekerjaan wajib diisi.');
      return;
    }
    if (form.description.trim().length < 10) {
      setError('Deskripsi masalah minimal 10 karakter.');
      return;
    }
    if (form.action_taken.trim().length < 10) {
      setError('Tindakan yang dilakukan minimal 10 karakter.');
      return;
    }

    const durationDecimal = getDurationHoursDecimal();
    if (durationDecimal <= 0) {
      setError('Durasi pengerjaan wajib diisi (jam dan/atau menit).');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Mengikuti Schema Multipart/form-data Swagger Backend Baru
      const fd = new FormData();
      fd.append('description', form.description);
      fd.append('action_taken', form.action_taken);
      fd.append('duration_hours', durationDecimal);
      if (form.notes) fd.append('notes', form.notes);

      const imageFile = base64ToFile(image, `bukti-tiket-${ticket.id}.jpg`);
      fd.append('image', imageFile);

      const updated = await ticketService.submitReport(ticket.id, fd);
      onSuccess(updated);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim laporan. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Input polos yang duduk DI DALAM kartu beraksen warna (bukan lagi kotak bordered sendiri)
  const fieldInputCls = "w-full bg-white/70 dark:bg-stone-900/40 border border-stone-200/70 dark:border-stone-700/50 rounded-lg px-3 py-2.5 text-sm text-stone-800 dark:text-white placeholder:text-stone-400 focus:ring-2 focus:ring-offset-0 outline-none transition-all";
  const inputDisabledCls = "w-full px-3 py-2.5 rounded-lg border border-stone-200/70 dark:border-stone-700/50 bg-white/40 dark:bg-stone-900/20 text-stone-500 dark:text-stone-400 text-sm cursor-not-allowed";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 w-full max-w-lg max-h-[92vh] flex flex-col">
        
        <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Send size={16} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                {ticket.status === 'Rejected' ? 'Submit Ulang Laporan (Revisi)' : 'Submit Laporan Perbaikan'}
              </h3>
              <p className="text-xs text-stone-400 truncate max-w-[220px]">{ticket.machine_name}</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => { stopCamera(); onClose(); }} 
            className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form id="submit-report-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {error && (
            <div ref={errorRef} className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {ticket.status === 'Rejected' && report && (
            <div className="px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs">
              Data di bawah ini diisi otomatis dari laporan sebelumnya yang ditolak. Silakan perbaiki bagian yang diminta, lalu unggah ulang foto bukti pekerjaan.
            </div>
          )}

          {/* Leader - aksen cyan */}
          <AccentField color="cyan" icon={UserCheck} label="Penanggung Jawab (Leader)">
            <input
              type="text"
              value={teamLeaderName}
              disabled
              readOnly
              className={inputDisabledCls}
            />
          </AccentField>

          {/* Deskripsi Masalah - aksen amber */}
          <AccentField color="amber" icon={AlertCircle} label="Deskripsi Masalah" required>
            <textarea 
              name="description" 
              required 
              minLength={10}
              rows={3} 
              value={form.description} 
              onChange={handleChange} 
              placeholder="Jelaskan masalah yang ditemukan... (min. 10 karakter)" 
              className={`${fieldInputCls} resize-none focus:border-amber-400 focus:ring-amber-500/20`} 
            />
          </AccentField>

          {/* Tindakan yang Dilakukan - aksen hijau */}
          <AccentField color="emerald" icon={CheckCircle2} label="Tindakan yang Dilakukan" required>
            <textarea 
              name="action_taken" 
              required 
              minLength={10}
              rows={3} 
              value={form.action_taken} 
              onChange={handleChange} 
              placeholder="Jelaskan tindakan perbaikan yang telah dilakukan... (min. 10 karakter)" 
              className={`${fieldInputCls} resize-none focus:border-emerald-400 focus:ring-emerald-500/20`} 
            />
          </AccentField>

          {/* Durasi - kartu solid biru, format Jam & Menit */}
          <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-3.5">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mb-2 text-blue-700 dark:text-blue-400">
              <Clock size={13} /> Durasi Pengerjaan <span className="text-red-500 normal-case">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  name="duration_h"
                  value={form.duration_h}
                  onChange={handleDurationChange}
                  placeholder="0"
                  className={`${fieldInputCls} focus:border-blue-400 focus:ring-blue-500/20 font-bold text-blue-700 dark:text-blue-300 text-center`}
                />
                <p className="text-[11px] text-blue-500 text-center mt-1 font-semibold">Jam</p>
              </div>
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  name="duration_m"
                  value={form.duration_m}
                  onChange={handleDurationChange}
                  placeholder="0"
                  className={`${fieldInputCls} focus:border-blue-400 focus:ring-blue-500/20 font-bold text-blue-700 dark:text-blue-300 text-center`}
                />
                <p className="text-[11px] text-blue-500 text-center mt-1 font-semibold">Menit</p>
              </div>
            </div>
          </div>

          {/* Catatan - aksen netral abu-abu */}
          <AccentField color="stone" icon={FileText} label="Catatan (opsional)">
            <input 
              type="text" 
              name="notes" 
              value={form.notes} 
              onChange={handleChange} 
              placeholder="Rekomendasi, temuan lain, dll..." 
              className={`${fieldInputCls} focus:border-stone-400 focus:ring-stone-500/20`}
            />
          </AccentField>

          {/* Foto Bukti - aksen violet */}
          <AccentField color="violet" icon={Camera} label="Foto Bukti Pekerjaan" required>
            {image ? (
              <div className="relative rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700">
                <img src={image} alt="Preview bukti" className="w-full h-52 object-cover" />
                <button 
                  type="button" 
                  onClick={() => { resetImage(); stopCamera(); }}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors" 
                  title="Hapus foto"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <>
                {isCameraOpen && (
                  <div className="mb-3 space-y-2">
                    <div className="relative rounded-lg overflow-hidden bg-black border border-stone-700">
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-52 object-cover" />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={takePicture}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold text-sm transition-all"
                      >
                        <Camera size={16} /> Ambil Foto
                      </button>
                      <button 
                        type="button" 
                        onClick={stopCamera}
                        className="px-4 py-2.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg font-bold text-sm transition-all"
                      >
                        <StopCircle size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {!isCameraOpen && (
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button" 
                      onClick={startCamera}
                      className="flex flex-col items-center justify-center gap-2 py-6 rounded-lg border-2 border-dashed border-violet-200 dark:border-violet-800/40 bg-white/60 dark:bg-stone-900/30 hover:border-violet-400 transition-all"
                    >
                      <Camera size={24} className="text-violet-400" />
                      <span className="text-xs font-bold text-violet-500">Buka Kamera</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-2 py-6 rounded-lg border-2 border-dashed border-violet-200 dark:border-violet-800/40 bg-white/60 dark:bg-stone-900/30 hover:border-violet-400 transition-all"
                    >
                      <Upload size={24} className="text-violet-400" />
                      <span className="text-xs font-bold text-violet-500">Upload File</span>
                    </button>
                  </div>
                )}
              </>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            <canvas ref={canvasRef} className="hidden" />
          </AccentField>
        </form>

        <div className="p-5 border-t border-stone-100 dark:border-stone-800 flex gap-3 shrink-0">
          <button 
            type="button" 
            onClick={() => { stopCamera(); onClose(); }}
            className="flex-1 px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-xl font-bold text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all text-sm"
          >
            Batal
          </button>
          <button 
            type="submit" 
            form="submit-report-form"
            disabled={isSubmitting || !image}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <><Loader2 size={14} className="animate-spin" /> Mengirim...</>
            ) : (
              <><Send size={14} /> Kirim Laporan</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SubmitReportModal;