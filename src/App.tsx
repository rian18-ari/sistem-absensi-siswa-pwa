/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  getCurrentUser,
  getSyncQueue,
  initStorage,
  subscribeToStorage,
} from './services/storage';
import { SyncConflict, User } from './types';
import { NetworkSyncBar } from './components/NetworkSyncBar';
import { Navbar } from './components/Navbar';
import { AttendanceSheet } from './components/AttendanceSheet';
import { AttendanceRecap } from './components/AttendanceRecap';
import { WaliKelasView } from './components/WaliKelasView';
import { ParentView } from './components/ParentView';
import { StudentView } from './components/StudentView';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminManagement } from './components/AdminManagement';
import { AuditLogView } from './components/AuditLogView';
import { ConflictResolutionModal } from './components/ConflictResolutionModal';
import { ShieldCheck, Wifi, Smartphone, CheckCircle, Database } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUserState] = useState<User>(getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>('input');
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [pendingQueueCount, setPendingQueueCount] = useState<number>(0);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  useEffect(() => {
    initStorage();
    const update = () => {
      setCurrentUserState(getCurrentUser());
      setPendingQueueCount(getSyncQueue().length);
    };

    update();
    const unsubscribe = subscribeToStorage(update);
    return () => unsubscribe();
  }, []);

  // Update tab default based on role if role changed
  useEffect(() => {
    if (currentUser.role === 'guru') {
      setActiveTab('input');
    } else if (currentUser.role === 'wali_kelas') {
      setActiveTab('wali');
    } else if (currentUser.role === 'admin') {
      setActiveTab('dashboard');
    } else if (currentUser.role === 'orang_tua') {
      setActiveTab('parent');
    } else if (currentUser.role === 'siswa') {
      setActiveTab('student');
    }
  }, [currentUser.role]);

  const handleConflictsDetected = (detected: SyncConflict[]) => {
    setConflicts(detected);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans">
      {/* 1. Global Offline & Network Synchronization Bar (PWA FR-PWA-04/05/06/09) */}
      <NetworkSyncBar onConflictsDetected={handleConflictsDetected} />

      {/* 2. Top Header & Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingQueueCount={pendingQueueCount}
      />

      {/* 3. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-16">
        {/* Guru / Wali Input Tab */}
        {activeTab === 'input' && (
          <AttendanceSheet
            currentUser={currentUser}
            onSuccessNotification={(msg) => setNotificationToast(msg)}
          />
        )}

        {/* Rekap Tab for Guru, Wali, Admin, Ortu, Siswa */}
        {activeTab === 'recap' && (
          <AttendanceRecap
            userRole={currentUser.role}
            filterClassId={currentUser.homeroomClassId}
            filterStudentId={currentUser.studentId}
          />
        )}

        {/* Wali Kelas Specialized View */}
        {activeTab === 'wali' && (
          <WaliKelasView
            currentUser={currentUser}
            onOpenRecap={() => setActiveTab('recap')}
          />
        )}

        {/* Orang Tua View */}
        {activeTab === 'parent' && <ParentView currentUser={currentUser} />}

        {/* Siswa Personal View */}
        {activeTab === 'student' && <StudentView currentUser={currentUser} />}

        {/* Admin Dashboard */}
        {activeTab === 'dashboard' && (
          <AdminDashboard onNavigateTab={(tab) => setActiveTab(tab)} />
        )}

        {/* Admin Management (Students, Teachers, Classes, Schedules) */}
        {activeTab === 'manage' && <AdminManagement currentUser={currentUser} />}

        {/* Audit Log View (FR-10 / FR-16) */}
        {activeTab === 'audit' && <AuditLogView />}
      </main>

      {/* 4. Conflict Resolution Dialog (FR-PWA-08) */}
      {conflicts.length > 0 && (
        <ConflictResolutionModal
          conflicts={conflicts}
          onResolved={() => {
            const next = conflicts.slice(1);
            setConflicts(next);
          }}
          onClose={() => setConflicts([])}
        />
      )}

      {/* 5. Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">SMA Negeri 1 Nusantara</span>
            <span>•</span>
            <span>Sistem Informasi Manajemen Absensi Siswa Berbasis PWA</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <span>Offline IndexedDB / Local Cache Aktif</span>
            </span>
            <span>•</span>
            <span>Sesuai Ketentuan Dokumen PRD</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
