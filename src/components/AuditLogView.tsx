import React, { useState } from 'react';
import { ShieldCheck, Clock, User, Search, Filter, History } from 'lucide-react';
import { getAuditLogs } from '../services/storage';

export const AuditLogView: React.FC = () => {
  const logs = getAuditLogs();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      (log.studentName && log.studentName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span>Audit Trail & Log Perubahan Absensi (FR-16)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mencatat setiap pengisian, revisi status beserta alasan, dan sinkronisasi untuk akuntabilitas.
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari aksi, nama penginput, atau siswa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none w-64"
          />
        </div>
      </div>

      {/* Log list */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
          Terdapat {filteredLogs.length} rekaman aktivitas sistem
        </div>

        <div className="divide-y divide-slate-100">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Belum ada log audit yang sesuai dengan pencarian.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-start gap-3 text-xs">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 flex-shrink-0 mt-0.5">
                  <History className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-xs">{log.action}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <p className="text-slate-700 mt-1 text-xs leading-relaxed">{log.details}</p>

                  <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      Pengguna: <strong className="text-slate-700">{log.userName}</strong> ({log.userRole})
                    </span>
                    {log.studentName && (
                      <span>
                        Siswa Terkait: <strong>{log.studentName}</strong>
                      </span>
                    )}
                    {log.className && (
                      <span>
                        Kelas: <strong>{log.className}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
