import React, { useState } from 'react';
import {
  UserCheck,
  Calendar,
  AlertCircle,
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  HelpCircle,
  HeartPulse,
} from 'lucide-react';
import { AttendanceRecord, ParentNotification, Student, User } from '../types';
import { getAttendanceRecords, getNotifications, getStudents } from '../services/storage';

interface Props {
  currentUser: User;
}

export const ParentView: React.FC<Props> = ({ currentUser }) => {
  const allStudents = getStudents();
  const allRecords = getAttendanceRecords();
  const allNotifications = getNotifications();

  // Find linked children for this parent
  const linkedIds = currentUser.linkedStudentIds || [];
  const parentStudents = allStudents.filter(
    (s) => linkedIds.includes(s.id) || s.parentName.toLowerCase().includes('budi santoso')
  );

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    parentStudents[0]?.id || allStudents[0]?.id || ''
  );

  const currentChild = allStudents.find((s) => s.id === selectedStudentId);

  // Filter records & notifications for selected child
  const childRecords = allRecords.filter((r) => r.studentId === selectedStudentId);
  const childNotifications = allNotifications.filter((n) => n.studentId === selectedStudentId);

  // Today's record
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = childRecords.find((r) => r.date === todayStr);

  // Overall attendance stats
  const total = childRecords.length;
  const hadir = childRecords.filter((r) => r.status === 'Hadir').length;
  const izin = childRecords.filter((r) => r.status === 'Izin').length;
  const sakit = childRecords.filter((r) => r.status === 'Sakit').length;
  const alpa = childRecords.filter((r) => r.status === 'Alpa').length;
  const rate = total > 0 ? Math.round((hadir / total) * 100) : 100;

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Child Switcher Banner (PRD: "Jika ada lebih dari satu anak, profil anak dipilih oleh orang tua") */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <span>Portal Pemantauan Kehadiran Anak</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau status presensi harian, riwayat ketidakhadiran, dan notifikasi sekolah.
            </p>
          </div>

          {/* Child Selector Tabs */}
          {parentStudents.length > 1 && (
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              <span className="text-xs font-semibold text-slate-500 pl-2">Pilih Anak:</span>
              {parentStudents.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedStudentId(child.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedStudentId === child.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {child.name} ({child.className})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Child Details */}
        {currentChild && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 font-bold text-lg flex items-center justify-center">
                {currentChild.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">{currentChild.name}</div>
                <div className="text-xs text-slate-500">
                  NISN: {currentChild.nisn} • Kelas: {currentChild.className} • Wali: {currentChild.parentName}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Persentase Hadir</div>
                <div className="text-xl font-black text-blue-600">{rate}%</div>
              </div>
              <div
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  todayRecord?.status === 'Hadir'
                    ? 'bg-emerald-100 text-emerald-800'
                    : todayRecord?.status === 'Izin'
                    ? 'bg-amber-100 text-amber-800'
                    : todayRecord?.status === 'Sakit'
                    ? 'bg-sky-100 text-sky-800'
                    : todayRecord?.status === 'Alpa'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Hari Ini: {todayRecord?.status || 'Belum Tercatat'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-emerald-600 uppercase">Hadir</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{hadir} Kali</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Tepat waktu</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-amber-600 uppercase">Izin</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{izin} Kali</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Konfirmasi wali</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-sky-600 uppercase">Sakit</div>
          <div className="text-2xl font-bold text-sky-700 mt-1">{sakit} Kali</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Dengan surat dokter</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-rose-600 uppercase">Alpa</div>
          <div className="text-2xl font-bold text-rose-700 mt-1">{alpa} Kali</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Tanpa kabar</div>
        </div>
      </div>

      {/* Notifications from School (WhatsApp / In-app alerts) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm">
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <span>Pemberitahuan Otomatis Ketidakhadiran (WhatsApp & SMS)</span>
        </div>

        <div className="mt-4 space-y-3">
          {childNotifications.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              Tidak ada notifikasi ketidakhadiran untuk ananda {currentChild?.name}. Ananda selalu hadir dengan baik.
            </div>
          ) : (
            childNotifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-bold bg-emerald-600 text-white text-[10px]">
                      {notif.channel}
                    </span>
                    <span className="font-semibold text-slate-800">
                      Status: {notif.status} • {notif.subjectName}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(notif.sentAt).toLocaleDateString('id-ID')}
                  </span>
                </div>

                <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-emerald-100 text-[11px] font-mono leading-relaxed">
                  "{notif.messageText}"
                </p>

                <div className="text-[10px] text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Status Pengiriman: {notif.deliveryStatus} ke nomor {notif.parentPhone}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* History of Child Attendance */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Riwayat Kehadiran Lengkap: {currentChild?.name}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Mata Pelajaran</th>
                <th className="py-2.5 px-3">Jam Pelajaran</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3">Keterangan</th>
                <th className="py-2.5 px-3">Guru Pengajar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {childRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    Belum ada riwayat absensi untuk ananda ini.
                  </td>
                </tr>
              ) : (
                childRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-800">{r.date}</td>
                    <td className="py-3 px-3 text-slate-700">{r.subjectName}</td>
                    <td className="py-3 px-3 text-slate-500">{r.timeSlot}</td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          r.status === 'Hadir'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'Izin'
                            ? 'bg-amber-100 text-amber-800'
                            : r.status === 'Sakit'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {r.notes || '-'}
                      {r.changeReason && (
                        <div className="text-[10px] text-blue-600 mt-0.5">
                          Ubah: {r.changeReason}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{r.recordedBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
