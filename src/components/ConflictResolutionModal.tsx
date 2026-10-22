import React from 'react';
import { AlertTriangle, Server, Smartphone, Check } from 'lucide-react';
import { SyncConflict } from '../types';
import { resolveConflict } from '../services/storage';

interface Props {
  conflicts: SyncConflict[];
  onResolved: () => void;
  onClose: () => void;
}

export const ConflictResolutionModal: React.FC<Props> = ({
  conflicts,
  onResolved,
  onClose,
}) => {
  if (conflicts.length === 0) return null;

  const current = conflicts[0];

  const handleChoose = (choice: 'keep_local' | 'keep_server') => {
    resolveConflict(current.attendanceId, choice);
    onResolved();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Hadir':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Hadir</span>;
      case 'Izin':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Izin</span>;
      case 'Sakit':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">Sakit</span>;
      case 'Alpa':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">Alpa</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Konflik Sinkronisasi Terdeteksi (FR-PWA-08)
            </h3>
            <p className="text-xs text-slate-500">
              Data absensi di server telah diubah oleh pengguna lain saat Anda berada di luar jaringan.
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
          <div className="font-semibold text-sm text-slate-900">{current.studentName}</div>
          <div>Mata Pelajaran: <strong>{current.subjectName}</strong></div>
          <div>Tanggal: <strong>{current.date}</strong></div>
        </div>

        {/* Side-by-side comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          {/* Local version */}
          <div className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-blue-800 font-semibold text-xs mb-2">
                <Smartphone className="w-4 h-4" />
                <span>Versi Perangkat (Offline Lokal)</span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500">Status Absen:</span>
                  <div className="mt-1">{getStatusBadge(current.localRecord.status)}</div>
                </div>
                {current.localRecord.notes && (
                  <div>
                    <span className="text-slate-500">Catatan:</span>
                    <div className="text-slate-800 font-medium">{current.localRecord.notes}</div>
                  </div>
                )}
                <div className="text-[11px] text-slate-400">
                  Diinput oleh: {current.localRecord.recordedBy}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleChoose('keep_local')}
              className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Gunakan Versi Lokal
            </button>
          </div>

          {/* Server version */}
          <div className="p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs mb-2">
                <Server className="w-4 h-4" />
                <span>Versi Server Pusat</span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500">Status Absen:</span>
                  <div className="mt-1">{getStatusBadge(current.serverRecord.status)}</div>
                </div>
                {current.serverRecord.notes && (
                  <div>
                    <span className="text-slate-500">Catatan:</span>
                    <div className="text-slate-800 font-medium">{current.serverRecord.notes}</div>
                  </div>
                )}
                <div className="text-[11px] text-slate-400">
                  Diperbarui oleh: {current.serverRecord.updatedBy || current.serverRecord.recordedBy}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleChoose('keep_server')}
              className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Gunakan Versi Server
            </button>
          </div>
        </div>

        <div className="mt-5 text-[11px] text-slate-400 text-center flex items-center justify-between">
          <span>Konflik tersisa: {conflicts.length}</span>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 underline cursor-pointer"
          >
            Tinjau Nanti
          </button>
        </div>
      </div>
    </div>
  );
};
