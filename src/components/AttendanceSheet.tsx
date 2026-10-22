import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  BookOpen,
  Users,
  CheckCircle2,
  FileText,
  AlertCircle,
  HelpCircle,
  Save,
  Check,
  Edit3,
  WifiOff,
  UserCheck,
  Info,
} from 'lucide-react';
import {
  AttendanceRecord,
  AttendanceStatus,
  ScheduleSession,
  SchoolClass,
  Student,
  User,
} from '../types';
import {
  checkDuplicateSession,
  getAttendanceRecords,
  getClasses,
  getEffectiveOnlineStatus,
  getSchedules,
  getStudents,
  saveAttendanceRecords,
  updateAttendanceWithReason,
} from '../services/storage';

interface Props {
  currentUser: User;
  onSuccessNotification?: (msg: string) => void;
}

interface StudentAttendanceRow {
  student: Student;
  status: AttendanceStatus | null;
  notes: string;
  existingRecordId?: string;
  isExisting: boolean;
  syncStatus?: string;
  changeReason?: string;
}

export const AttendanceSheet: React.FC<Props> = ({ currentUser, onSuccessNotification }) => {
  const isOnline = getEffectiveOnlineStatus();
  const classes = getClasses();
  const schedules = getSchedules();
  const allStudents = getStudents();

  // Filter schedules taught by this user if guru, or all if admin/wali
  const availableSchedules =
    currentUser.role === 'admin'
      ? schedules
      : currentUser.teacherId
      ? schedules.filter((s) => s.teacherId === currentUser.teacherId)
      : schedules;

  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(
    availableSchedules[0]?.id || schedules[0]?.id || ''
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [rows, setRows] = useState<StudentAttendanceRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Edit reason modal state
  const [editingRow, setEditingRow] = useState<{
    index: number;
    newStatus: AttendanceStatus;
    studentName: string;
    existingId: string;
  } | null>(null);
  const [modalChangeReason, setModalChangeReason] = useState('');

  // Selected schedule details
  const currentSchedule = schedules.find((s) => s.id === selectedScheduleId);
  const currentClass = classes.find((c) => c.id === currentSchedule?.classId);

  // Load roster and existing attendance records for the selected class & date & schedule
  useEffect(() => {
    if (!currentSchedule) {
      setRows([]);
      return;
    }

    const classStudents = allStudents.filter((s) => s.classId === currentSchedule.classId);
    const existingRecords = getAttendanceRecords().filter(
      (r) => r.scheduleId === currentSchedule.id && r.date === selectedDate
    );

    const initialRows: StudentAttendanceRow[] = classStudents.map((student) => {
      const match = existingRecords.find((r) => r.studentId === student.id);
      if (match) {
        return {
          student,
          status: match.status,
          notes: match.notes || '',
          existingRecordId: match.id,
          isExisting: true,
          syncStatus: match.syncStatus,
        };
      }
      return {
        student,
        status: null, // belum diisi
        notes: '',
        isExisting: false,
      };
    });

    setRows(initialRows);
  }, [selectedScheduleId, selectedDate]);

  const handleStatusClick = (index: number, newStatus: AttendanceStatus) => {
    const row = rows[index];

    // If record already exists in database and we are modifying its status, require a reason (FR-10)
    if (row.isExisting && row.existingRecordId && row.status !== newStatus) {
      setEditingRow({
        index,
        newStatus,
        studentName: row.student.name,
        existingId: row.existingRecordId,
      });
      setModalChangeReason('');
      return;
    }

    // Direct update for new records or unsubmitted changes
    const updated = [...rows];
    updated[index] = {
      ...row,
      status: row.status === newStatus ? null : newStatus,
    };
    setRows(updated);
  };

  const handleNoteChange = (index: number, notes: string) => {
    const updated = [...rows];
    updated[index].notes = notes;
    setRows(updated);
  };

  const confirmStatusChangeWithReason = () => {
    if (!editingRow) return;
    if (!modalChangeReason.trim()) {
      alert('Mohon cantumkan alasan perubahan status absensi.');
      return;
    }

    const row = rows[editingRow.index];
    updateAttendanceWithReason(
      editingRow.existingId,
      editingRow.newStatus,
      modalChangeReason.trim(),
      row.notes,
      currentUser
    );

    const updated = [...rows];
    updated[editingRow.index] = {
      ...row,
      status: editingRow.newStatus,
      syncStatus: isOnline ? 'synced' : 'pending',
    };
    setRows(updated);

    setSuccessToast(`Status ${editingRow.studentName} berhasil diperbarui.`);
    setTimeout(() => setSuccessToast(null), 3000);
    setEditingRow(null);
  };

  // Quick action: Mark all unassigned as "Hadir" (< 2 mins per class efficiency goal)
  const handleMarkAllPresent = () => {
    const updated = rows.map((r) => {
      if (r.isExisting) return r; // don't overwrite saved records without modal
      return {
        ...r,
        status: r.status || 'Hadir',
      };
    });
    setRows(updated);
  };

  const handleSaveAttendance = () => {
    if (!currentSchedule || !currentClass) return;

    // Check if any student hasn't been assigned a status
    const unassigned = rows.filter((r) => r.status === null);
    if (unassigned.length > 0) {
      const confirmSave = confirm(
        `Masih ada ${unassigned.length} siswa yang belum diberi status kehadiran. Apakah Anda ingin menandai mereka sebagai 'Alpa' atau simpan siswa yang sudah diberi status saja?`
      );
      if (!confirmSave) return;
    }

    setIsSubmitting(true);

    const recordsToSave = rows
      .filter((r) => r.status !== null)
      .map((r) => ({
        studentId: r.student.id,
        studentName: r.student.name,
        nisn: r.student.nisn,
        classId: currentClass.id,
        className: currentClass.name,
        scheduleId: currentSchedule.id,
        subjectName: currentSchedule.subjectName,
        date: selectedDate,
        timeSlot: currentSchedule.timeSlot,
        status: r.status as AttendanceStatus,
        notes: r.notes,
        recordedBy: currentUser.name,
        recordedById: currentUser.id,
        recordedAt: new Date().toISOString(),
      }));

    const result = saveAttendanceRecords(recordsToSave, currentUser);

    setIsSubmitting(false);

    // Refresh rows as existing
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        isExisting: r.status !== null,
        syncStatus: isOnline ? 'synced' : 'pending',
      }))
    );

    setSuccessToast(result.message);
    onSuccessNotification?.(result.message);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Metrics
  const total = rows.length;
  const hadirCount = rows.filter((r) => r.status === 'Hadir').length;
  const izinCount = rows.filter((r) => r.status === 'Izin').length;
  const sakitCount = rows.filter((r) => r.status === 'Sakit').length;
  const alpaCount = rows.filter((r) => r.status === 'Alpa').length;
  const belumDiisiCount = rows.filter((r) => r.status === null).length;

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Input Absensi Siswa</span>
              {!isOnline && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                  <WifiOff className="w-3 h-3" />
                  Mode Offline Aktif
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Pilih jadwal mengajar dan catat kehadiran siswa. Data tersimpan lokal jika jaringan terputus.
            </p>
          </div>

          {/* Schedule & Date Selectors */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Jadwal / Mata Pelajaran
              </label>
              <select
                value={selectedScheduleId}
                onChange={(e) => setSelectedScheduleId(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                {availableSchedules.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.className} - {s.subjectName} ({s.day}, {s.timeSlot})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Tanggal Absensi
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Schedule Info Card */}
        {currentSchedule && currentClass && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Kelas</div>
              <div className="font-bold text-slate-800">{currentClass.name} ({currentClass.academicYear})</div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Wali Kelas</div>
              <div className="font-semibold text-slate-800 truncate">{currentClass.homeroomTeacherName}</div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Jam & Ruang</div>
              <div className="font-semibold text-slate-800">{currentSchedule.timeSlot} • {currentSchedule.room}</div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Guru Pengajar</div>
              <div className="font-semibold text-slate-800 truncate">{currentSchedule.teacherName}</div>
            </div>
          </div>
        )}
      </div>

      {/* Success Notification Alert */}
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-600 hover:text-emerald-900 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Stats Summary Bar & Bulk Actions */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <span className="font-semibold text-slate-700">Total: {total} Siswa</span>
          <span className="text-slate-300">|</span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
            Hadir: {hadirCount}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold">
            Izin: {izinCount}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-semibold">
            Sakit: {sakitCount}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-semibold">
            Alpa: {alpaCount}
          </span>
          {belumDiisiCount > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-medium">
              Belum Diisi: {belumDiisiCount}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllPresent}
            type="button"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Tandai semua siswa yang belum diabsen menjadi Hadir"
          >
            Tandai Semua Hadir
          </button>

          <button
            onClick={handleSaveAttendance}
            disabled={isSubmitting || total === 0}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold text-white shadow-xs flex items-center gap-1.5 cursor-pointer transition-all ${
              isOnline
                ? 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                : 'bg-amber-600 hover:bg-amber-700 active:scale-95'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>
              {isSubmitting ? 'Menyimpan...' : isOnline ? 'Simpan & Kirim' : 'Simpan Lokal (Offline)'}
            </span>
          </button>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-3">Nama Siswa / NISN</th>
                <th className="py-3 px-3 w-20 text-center">L/P</th>
                <th className="py-3 px-3 text-center w-72">Status Kehadiran</th>
                <th className="py-3 px-3 min-w-[200px]">Keterangan / Surat Izin</th>
                <th className="py-3 px-3 w-24 text-center">Status Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada siswa terdaftar pada kelas ini.
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => {
                  const isUnassigned = row.status === null;

                  return (
                    <tr
                      key={row.student.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isUnassigned ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center font-medium text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{row.student.name}</div>
                        <div className="text-[11px] text-slate-400">NISN: {row.student.nisn}</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                          {row.student.gender}
                        </span>
                      </td>

                      {/* Status Buttons: H, I, S, A */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 gap-1">
                          <button
                            type="button"
                            onClick={() => handleStatusClick(idx, 'Hadir')}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                              row.status === 'Hadir'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Hadir
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusClick(idx, 'Izin')}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                              row.status === 'Izin'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Izin
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusClick(idx, 'Sakit')}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                              row.status === 'Sakit'
                                ? 'bg-sky-500 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Sakit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusClick(idx, 'Alpa')}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                              row.status === 'Alpa'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Alpa
                          </button>
                        </div>
                      </td>

                      {/* Notes / Surat Izin input */}
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          placeholder={
                            row.status === 'Sakit'
                              ? 'Contoh: Flu berat / Surat dr. Rudy'
                              : row.status === 'Izin'
                              ? 'Contoh: Izin acara keluarga'
                              : row.status === 'Alpa'
                              ? 'Tanpa keterangan'
                              : 'Catatan opsional...'
                          }
                          value={row.notes}
                          onChange={(e) => handleNoteChange(idx, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400"
                        />
                      </td>

                      {/* Status Data (Synced vs Pending vs Belum Diisi) */}
                      <td className="py-3 px-3 text-center">
                        {isUnassigned ? (
                          <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Belum Diisi
                          </span>
                        ) : row.syncStatus === 'pending' || !row.isExisting ? (
                          <span className="text-[10px] font-medium text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
                            Lokal (Draft)
                          </span>
                        ) : row.syncStatus === 'conflict' ? (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                            Konflik
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full flex items-center justify-center gap-1">
                            <Check className="w-3 h-3" />
                            Tersimpan
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Reason Modal (FR-10: Perubahan status absensi serta alasan perubahan) */}
      {editingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Konfirmasi Perubahan Status Absensi
                </h3>
                <p className="text-xs text-slate-500">
                  Diwajibkan mencatat alasan perubahan untuk audit trail (FR-10/FR-16)
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div>
                  Siswa: <strong>{editingRow.studentName}</strong>
                </div>
                <div>
                  Ubah status menjadi:{' '}
                  <span className="font-bold text-blue-600 uppercase">
                    {editingRow.newStatus}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alasan Perubahan Status <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={modalChangeReason}
                  onChange={(e) => setModalChangeReason(e.target.value)}
                  placeholder="Misal: Surat dokter baru diterima siang hari / Orang tua telah mengonfirmasi izin via telepon..."
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingRow(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmStatusChangeWithReason}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
