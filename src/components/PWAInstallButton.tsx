import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  // If already installed and running standalone
  if (isInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle className="w-3.5 h-3.5" />
        PWA Terpasang
      </span>
    );
  }

  // Direct prompt available (Chrome / Edge / Android)
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
        title="Pasang aplikasi ke layar utama untuk akses cepat dan mode offline"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install PWA</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
          title="Pasang di iOS"
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-600" />
          <span>Pasang di iPhone/iPad</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Pasang di iPhone / iPad</h3>
                    <p className="text-xs text-slate-500">Akses cepat tanpa browser bar</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px]">1</span>
                  <span>Buka website ini di browser <strong>Safari</strong> iPhone/iPad Anda.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px]">2</span>
                  <span className="flex items-center gap-1">
                    Ketuk tombol <strong>Bagikan / Share</strong> <Share className="w-3.5 h-3.5 inline text-blue-600" /> di bilah bawah.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px]">3</span>
                  <span>Gulir ke bawah dan ketuk <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop or browsers where prompt event hasn't fired yet
  return (
    <>
      <button
        onClick={() => setShowManualModal(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
        title="Info PWA & Instalasi"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Info PWA</span>
        <span className="sm:hidden">PWA</span>
      </button>

      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Instalasi Aplikasi PWA</h3>
                  <p className="text-xs text-slate-500">Progressive Web App - Siap Offline</p>
                </div>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Sistem Absensi Siswa ini dibangun sebagai <strong>Progressive Web App (PWA)</strong> dengan standar W3C & Service Worker aktif:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                <li>Dapat diinstal ke desktop (Chrome/Edge/Brave) melalui ikon install di bilah alamat browser.</li>
                <li>Pada ponsel Android/iOS, pilih menu browser dan klik <em>"Tambahkan ke Layar Utama"</em>.</li>
                <li>Mendukung input absensi saat internet mati (Offline Mode) dan sinkronisasi otomatis saat terhubung kembali.</li>
              </ul>
            </div>

            <button
              onClick={() => setShowManualModal(false)}
              className="mt-5 w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};
