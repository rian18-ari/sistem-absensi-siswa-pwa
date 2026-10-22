import React, { useState } from 'react';
import {
  BookOpen,
  AlertTriangle,
  Send,
  Phone,
  CheckCircle,
  Clock,
  User,
  Users,
  Calendar,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';
import { AttendanceRecord, Student, User as UserType } from '../types';
import {
  getAttendanceRecords,
  getClasses,
  getStudents,
  getNotifications,
} from '../services/storage';

interface Props {
  currentUser: UserType;
  onOpenRecap?: () => void;
}

export const WaliKelasView: React.FC<Props> = ({ currentUser, onOpenRecap }) => {
  const classes = getClasses();
  const allStudents = getStudents();
  const allRecords = getAttendanceRecords();
  const notifications = getNotifications();

  // Find class managed by this Wali Kelas, default to X IPA 1
  const homeroomClass =
    classes.find((c) => c.homeroomTeacherId === currentUser.teacherId) ||
    classes.find((c) => c.id === currentUser.homeroomClassId) ||
    classes[0];

  const classStudents = allStudents.filter((s) => s.classId === homeroomClass.id);
  const classRecords = allRecords.filter((r) => r.classId === homeroomClass.id);

  // Modal for parent contact follow-up
  const [selectedStudentFollowUp, setSelectedStudentFollowUp] = useState<Student | null>(null);
  const [followUpAction, setFollowUpAction] = useState<string>('wa');
  const [followUpNote, setFollowUpNote] = useState<string>('');
  const [followUpSuccess, setFollowUpSuccess] = useState<string | null>(null);

  // Compute stats per student
  const studentStats = classStudents.map((student) => {
    const studentRecords = classRecords.filter((r) => r.studentId === student.id);
    const totalSessions = studentRecords.length;
    const hadir = studentRecords.filter((r) => r.status === 'Hadir').length;
    const izin = studentRecords.filter((r) => r.status === 'Izin').length;
    const sakit = studentRecords.filter((r) => r.status === 'Sakit').length;
    const alpa = studentRecords.filter((r) => r.status === 'Alpa').length;
    const percentage = totalSessions > 0 ? Math.round((hadir / totalSessions) * 100) : 100;

    return {
      student,
      totalSessions,
      hadir,
      izin,
      sakit,
      alpa,
      percentage,
      needsFollowUp: alpa >= 2 || percentage < 85,
    };
  });

  const studentsNeedingFollowUp = studentStats.filter((s) => s.needsFollowUp);

  // Class overall attendance percentage
  const totalClassSessions = classRecords.length;
  const totalClassHadir = classRecords.filter((r) => r.status === 'Hadir').length;
  const classAttendanceRate =
    totalClassSessions > 0 ? Math.round((totalClassHadir / totalClassSessions) * 100) : 100;

  const handleSendFollowUp = () => {
    if (!selectedStudentFollowUp) return;
    setFollowUpSuccess(
      `Pemberitahuan tindak lanjut untuk wali murid dari ${selectedStudentFollowUp.name} (${selectedStudentFollowUp.parentName}) telah tercatat & dikirim.`
    );
    setTimeout(() => {
      setFollowUpSuccess(null);
      setSelectedStudentFollowUp(null);
      setFollowUpNote('');
    }, 2500);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-5 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-xs font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ruang Wali Kelas</span>
            </div>
            <h2 className="text-xl font-bold">
              Kelas {homeroomClass.name} • Tahun {homeroomClass.academicYear}
            </h2>
            <p className="text-xs text-blue-200 mt-1">
              Wali Kelas: <strong>{homeroomClass.homeroomTeacherName}</strong> • {classStudents.length} Siswa Terdaftar
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
            <div>
              <div className="text-[11px] text-blue-200 uppercase font-medium">Tingkat Hadir Kelas</div>
              <div className="text-2xl font-black">{classAttendanceRate}%</div>
              <div className="text-[10px] text-blue-200">Target sekolah: 98%</div>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-blue-400 flex items-center justify-center font-bold text-xs">
              {classAttendanceRate >= 98 ? 'A+' : classAttendanceRate >= 85 ? 'B' : 'Perlu Intervensi'}
            </div>
          </div>
        </div>
      </div>

      {/* At-Risk Students Follow-Up Alert (PRD section 3 & 10) */}
      {studentsNeedingFollowUp.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm mb-2">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>Peringatan: {studentsNeedingFollowUp.length} Siswa Membutuhkan Tindak Lanjut Absensi</span>
          </div>
          <p className="text-xs text-amber-800 mb-3">
            Siswa dengan Alpa ≥ 2 atau persentase kehadiran di bawah 85% memerlukan intervensi bimbingan konseling dan konfirmasi langsung ke orang tua/wali.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {studentsNeedingFollowUp.map((item) => (
              <div
                key={item.student.id}
                className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-bold text-slate-900 text-xs">{item.student.name}</div>
                  <div className="text-[11px] text-slate-500">
                    Wali: {item.student.parentName} ({item.student.parentPhone})
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px]">
                    <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold">
                      {item.alpa} Alpa
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                      Kehadiran {item.percentage}%
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStudentFollowUp(item.student)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Tindak Lanjut</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Homeroom Roster Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Daftar Rekap Absensi Siswa Kelas {homeroomClass.name}
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-3">Nama Siswa</th>
                <th className="py-2.5 px-3">NISN</th>
                <th className="py-2.5 px-3 text-center">Hadir</th>
                <th className="py-2.5 px-3 text-center">Izin</th>
                <th className="py-2.5 px-3 text-center">Sakit</th>
                <th className="py-2.5 px-3 text-center">Alpa</th>
                <th className="py-2.5 px-3 text-center">% Kehadiran</th>
                <th className="py-2.5 px-3 text-center">Status Siswa</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentStats.map((item, idx) => (
                <tr key={item.student.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 text-center font-medium text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {item.student.name}
                    <div className="text-[10px] text-slate-400 font-normal">
                      Ortu: {item.student.parentName}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-500">{item.student.nisn}</td>
                  <td className="py-3 px-3 text-center font-semibold text-emerald-700">{item.hadir}</td>
                  <td className="py-3 px-3 text-center font-medium text-amber-700">{item.izin}</td>
                  <td className="py-3 px-3 text-center font-medium text-sky-700">{item.sakit}</td>
                  <td className="py-3 px-3 text-center font-bold text-rose-700">{item.alpa}</td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`font-black ${
                        item.percentage >= 90
                          ? 'text-emerald-700'
                          : item.percentage >= 80
                          ? 'text-amber-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {item.percentage}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {item.needsFollowUp ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                        Perlu Perhatian
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        Aman
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => setSelectedStudentFollowUp(item.student)}
                      className="px-2.5 py-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg cursor-pointer"
                    >
                      Hubungi Ortu
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Follow-up modal */}
      {selectedStudentFollowUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Tindak Lanjut Orang Tua / Wali Siswa
                </h3>
                <p className="text-xs text-slate-500">
                  Komunikasi tindak lanjut ketidakhadiran siswa
                </p>
              </div>
            </div>

            {followUpSuccess ? (
              <div className="my-6 p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{followUpSuccess}</span>
              </div>
            ) : (
              <div className="mt-4 space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div>Siswa: <strong>{selectedStudentFollowUp.name}</strong></div>
                  <div>Orang Tua / Wali: <strong>{selectedStudentFollowUp.parentName}</strong></div>
                  <div>No. WhatsApp / HP: <strong>{selectedStudentFollowUp.parentPhone}</strong></div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Metode Tindak Lanjut
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFollowUpAction('wa')}
                      className={`p-2 rounded-xl border text-center font-semibold cursor-pointer ${
                        followUpAction === 'wa'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      Pesan WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => setFollowUpAction('call')}
                      className={`p-2 rounded-xl border text-center font-semibold cursor-pointer ${
                        followUpAction === 'call'
                          ? 'bg-blue-50 border-blue-500 text-blue-800'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      Panggilan Telepon
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Catatan Intervensi / Hasil Komunikasi
                  </label>
                  <textarea
                    rows={3}
                    value={followUpNote}
                    onChange={(e) => setFollowUpNote(e.target.value)}
                    placeholder="Contoh: Orang tua berjanji akan mengawasi anak dan mengirimkan surat izin resmi ke sekolah besok..."
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedStudentFollowUp(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSendFollowUp}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim & Simpan Tindak Lanjut</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
