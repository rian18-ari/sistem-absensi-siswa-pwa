import React, { useEffect, useState } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Clock,
  AlertCircle,
  CheckCircle2,
  Database,
  Sliders,
  AlertTriangle,
} from 'lucide-react';
import {
  getEffectiveOnlineStatus,
  getLastPreloadTime,
  getSyncQueue,
  isSimulatedOffline,
  refreshPreloadedData,
  setSimulatedOffline,
  subscribeToStorage,
  syncPendingQueue,
  triggerSimulatedConflict,
} from '../services/storage';
import { SyncConflict, SyncQueueItem } from '../types';

interface Props {
  onConflictsDetected?: (conflicts: SyncConflict[]) => void;
}

export const NetworkSyncBar: React.FC<Props> = ({ onConflictsDetected }) => {
  const [isOnline, setIsOnline] = useState(getEffectiveOnlineStatus());
  const [isSimulatingOffline, setIsSimulatingOffline] = useState(isSimulatedOffline());
  const [queue, setQueue] = useState<SyncQueueItem[]>(getSyncQueue());
  const [lastPreload, setLastPreload] = useState(getLastPreloadTime());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<{
    time: string;
    message: string;
    type: 'success' | 'warning' | 'error';
  } | null>(null);
  const [showQueueDetails, setShowQueueDetails] = useState(false);

  useEffect(() => {
    const update = () => {
      setIsOnline(getEffectiveOnlineStatus());
      setIsSimulatingOffline(isSimulatedOffline());
      setQueue(getSyncQueue());
      setLastPreload(getLastPreloadTime());
    };

    const handleBrowserOnline = () => {
      update();
      // Auto-sync when reconnecting (FR-PWA-04)
      if (!isSimulatedOffline()) {
        triggerSync();
      }
    };

    const handleBrowserOffline = () => {
      update();
    };

    window.addEventListener('online', handleBrowserOnline);
    window.addEventListener('offline', handleBrowserOffline);
    const unsubscribe = subscribeToStorage(update);

    return () => {
      window.removeEventListener('online', handleBrowserOnline);
      window.removeEventListener('offline', handleBrowserOffline);
      unsubscribe();
    };
  }, []);

  const triggerSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const result = await syncPendingQueue();
      if (result.conflicts.length > 0) {
        onConflictsDetected?.(result.conflicts);
        setLastSyncResult({
          time: new Date().toLocaleTimeString('id-ID'),
          message: `${result.syncedCount} tersinkron, ${result.conflicts.length} konflik perlu ditinjau!`,
          type: 'warning',
        });
      } else if (result.errors > 0) {
        setLastSyncResult({
          time: new Date().toLocaleTimeString('id-ID'),
          message: `${result.syncedCount} tersinkron, ${result.errors} gagal.`,
          type: 'error',
        });
      } else {
        setLastSyncResult({
          time: new Date().toLocaleTimeString('id-ID'),
          message: result.syncedCount > 0 ? `${result.syncedCount} data berhasil disinkronkan ke server` : 'Semua data telah sinkron',
          type: 'success',
        });
      }
    } catch (e: any) {
      setLastSyncResult({
        time: new Date().toLocaleTimeString('id-ID'),
        message: e.message || 'Gagal sinkronisasi',
        type: 'error',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleSimulation = () => {
    const nextVal = !isSimulatingOffline;
    setSimulatedOffline(nextVal);
    setIsSimulatingOffline(nextVal);
    setIsOnline(!nextVal);
    if (!nextVal) {
      // Auto sync when re-enabled
      setTimeout(triggerSync, 300);
    }
  };

  const pendingCount = queue.filter((q) => q.status === 'pending' || q.status === 'failed').length;
  const conflictCount = queue.filter((q) => q.status === 'conflict').length;

  const formatPreloadTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '-';
    }
  };

  return (
    <>
      <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs px-3 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Network status & preloaded cache status */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            {/* Status Badge */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${
                isOnline
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>Mode Offline (Disimpan Lokal)</span>
                </>
              )}
            </div>

            {/* Offline cache info */}
            <div className="hidden md:flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Database className="w-3 h-3 text-slate-500" />
              <span>Data Roster Offline: <strong>Aktif</strong> (Diperbarui {formatPreloadTime(lastPreload)})</span>
              <button
                onClick={() => refreshPreloadedData()}
                title="Perbarui cache data siswa & kelas untuk offline"
                className="hover:text-blue-400 cursor-pointer underline text-[10px] ml-1"
              >
                Muat Ulang
              </button>
            </div>
          </div>

          {/* Right: Sync Status, Queue Count & Simulation Switch */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Pending count badge */}
            {pendingCount > 0 && (
              <button
                onClick={() => setShowQueueDetails(true)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 hover:bg-amber-400/30 transition-colors cursor-pointer"
                title="Klik untuk melihat antrean sinkronisasi"
              >
                <AlertCircle className="w-3 h-3" />
                <span className="font-semibold">{pendingCount}</span>
                <span className="hidden sm:inline">menunggu sync</span>
              </button>
            )}

            {conflictCount > 0 && (
              <button
                onClick={() => setShowQueueDetails(true)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 cursor-pointer"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>{conflictCount} Konflik</span>
              </button>
            )}

            {/* Sync now button (FR-PWA-06) */}
            <button
              onClick={triggerSync}
              disabled={!isOnline || isSyncing}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                !isOnline
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : isSyncing
                  ? 'bg-blue-600 text-white cursor-wait opacity-80'
                  : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer active:scale-95'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan'}</span>
            </button>

            {/* Offline simulation toggle for testing */}
            <button
              onClick={toggleSimulation}
              className={`hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px] font-medium transition-colors cursor-pointer ${
                isSimulatingOffline
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Aktifkan simulasi offline untuk mengetes pengisian absensi tanpa internet dan sinkronisasi"
            >
              <Sliders className="w-3 h-3" />
              <span>{isSimulatingOffline ? 'Mode: Simulasi Offline Aktif' : 'Simulasi Offline'}</span>
            </button>
          </div>
        </div>

        {/* Sync message banner if any */}
        {lastSyncResult && (
          <div className="max-w-7xl mx-auto mt-1 text-[11px] flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-1.5">
              {lastSyncResult.type === 'success' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              {lastSyncResult.type === 'warning' && <AlertTriangle className="w-3 h-3 text-amber-400" />}
              {lastSyncResult.type === 'error' && <AlertCircle className="w-3 h-3 text-rose-400" />}
              <span>{lastSyncResult.message} ({lastSyncResult.time})</span>
            </div>
            <button
              onClick={() => setLastSyncResult(null)}
              className="text-slate-500 hover:text-slate-300 text-[10px]"
            >
              Tutup
            </button>
          </div>
        )}
      </div>

      {/* Queue Modal Inspector */}
      {showQueueDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Antrean Sinkronisasi Offline (FR-PWA-05/09)</h3>
                  <p className="text-xs text-slate-500">
                    {queue.length} rekaman dalam antrean perangkat lokal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQueueDetails(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 max-h-72 overflow-y-auto space-y-2">
              {queue.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  Tidak ada antrean tertunda. Semua absensi sudah tersinkronkan ke server.
                </p>
              ) : (
                queue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{item.data.studentName}</div>
                      <div className="text-slate-500 text-[11px]">
                        {item.data.className} • {item.data.subjectName} ({item.data.date})
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Status: <span className="font-medium text-slate-700">{item.data.status}</span> • Percobaan: {item.attempts}x
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                          item.status === 'conflict'
                            ? 'bg-rose-100 text-rose-700'
                            : item.status === 'failed'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {item.status === 'conflict'
                          ? 'Konflik Server'
                          : item.status === 'failed'
                          ? 'Gagal'
                          : 'Belum Sinkron'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  triggerSimulatedConflict();
                  setShowQueueDetails(false);
                }}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium cursor-pointer"
                title="Membuat simulasi perbedaan versi antara client dan server"
              >
                + Tes Skenario Konflik
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowQueueDetails(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    setShowQueueDetails(false);
                    triggerSync();
                  }}
                  disabled={!isOnline || isSyncing}
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                >
                  Coba Sinkronkan Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
