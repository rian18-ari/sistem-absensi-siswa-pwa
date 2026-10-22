import React from 'react';
import {
  GraduationCap,
  Users,
  CalendarCheck,
  BookOpen,
  ClipboardList,
  ShieldCheck,
  Bell,
  UserCheck,
  ChevronDown,
  LogOut,
  Smartphone,
} from 'lucide-react';
import { Role, User } from '../types';
import { getAllUsers, setCurrentUser } from '../services/storage';
import { PWAInstallButton } from './PWAInstallButton';

interface Props {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuditLog?: () => void;
  pendingQueueCount: number;
}

export const Navbar: React.FC<Props> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuditLog,
  pendingQueueCount,
}) => {
  const allUsers = getAllUsers();

  const handleSwitchUser = (userId: string) => {
    const target = allUsers.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      // reset tab to default for role
      if (target.role === 'admin') setActiveTab('dashboard');
      else if (target.role === 'guru') setActiveTab('input');
      else if (target.role === 'wali_kelas') setActiveTab('wali');
      else if (target.role === 'orang_tua') setActiveTab('parent');
      else if (target.role === 'siswa') setActiveTab('student');
    }
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case 'admin':
        return 'Admin Sekolah';
      case 'guru':
        return 'Guru Mata Pelajaran';
      case 'wali_kelas':
        return 'Wali Kelas';
      case 'orang_tua':
        return 'Orang Tua / Wali';
      case 'siswa':
        return 'Siswa';
    }
  };

  const getRoleBadgeStyle = (role: Role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'guru':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'wali_kelas':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'orang_tua':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'siswa':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner: School Brand & User Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-slate-900 leading-none">
                SIM Absensi Siswa
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                PWA v1.2
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              SMA Negeri 1 Nusantara • Th. 2024/2025
            </span>
          </div>
        </div>

        {/* Right side controls: Role Quick Switcher + PWA Install */}
        <div className="flex items-center gap-2 sm:gap-3">
          <PWAInstallButton />

          {/* Quick Role Switcher */}
          <div className="relative flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
            <div className="text-right hidden md:block">
              <div className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {getRoleLabel(currentUser.role)}
              </div>
            </div>

            <select
              value={currentUser.id}
              onChange={(e) => handleSwitchUser(e.target.value)}
              aria-label="Pilih Peran Demo"
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer pr-1"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  [{getRoleLabel(u.role)}] {u.name.split(' (')[0]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Role Navigation Bar */}
      <div className="border-t border-slate-100 bg-slate-50/70 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          <nav className="flex space-x-1 sm:space-x-2 py-1.5">
            {/* Guru Tabs */}
            {currentUser.role === 'guru' && (
              <>
                <button
                  onClick={() => setActiveTab('input')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'input'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Input Absensi Kelas</span>
                </button>
                <button
                  onClick={() => setActiveTab('recap')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'recap'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Rekap Kehadiran</span>
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'audit'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Log Audit & Alasan</span>
                </button>
              </>
            )}

            {/* Wali Kelas Tabs */}
            {currentUser.role === 'wali_kelas' && (
              <>
                <button
                  onClick={() => setActiveTab('wali')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'wali'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Dashboard Wali Kelas</span>
                </button>
                <button
                  onClick={() => setActiveTab('recap')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'recap'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Rekap Kelas Binaan</span>
                </button>
                <button
                  onClick={() => setActiveTab('input')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'input'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Input Absensi</span>
                </button>
              </>
            )}

            {/* Admin Tabs */}
            {currentUser.role === 'admin' && (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Ringkasan Sekolah</span>
                </button>
                <button
                  onClick={() => setActiveTab('manage')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'manage'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Manajemen Data (Siswa/Guru/Kelas)</span>
                </button>
                <button
                  onClick={() => setActiveTab('recap')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'recap'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Rekap & Unduh Laporan</span>
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'audit'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Log Audit Sistem</span>
                </button>
              </>
            )}

            {/* Orang Tua Tabs */}
            {currentUser.role === 'orang_tua' && (
              <>
                <button
                  onClick={() => setActiveTab('parent')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'parent'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Status Kehadiran Anak</span>
                </button>
                <button
                  onClick={() => setActiveTab('recap')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'recap'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Riwayat Kehadiran Lengkap</span>
                </button>
              </>
            )}

            {/* Siswa Tabs */}
            {currentUser.role === 'siswa' && (
              <>
                <button
                  onClick={() => setActiveTab('student')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'student'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Kehadiran Saya</span>
                </button>
                <button
                  onClick={() => setActiveTab('recap')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'recap'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Riwayat Absensi</span>
                </button>
              </>
            )}
          </nav>

          {/* Quick role indicator tag */}
          <div className="hidden lg:flex items-center gap-2">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getRoleBadgeStyle(
                currentUser.role
              )}`}
            >
              Mode: {getRoleLabel(currentUser.role)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
