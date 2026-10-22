import React from 'react';
import { UserCheck, Award, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { User } from '../types';
import { getAttendanceRecords, getStudents } from '../services/storage';

interface Props {
  currentUser: User;
}

export const StudentView: React.FC<Props> = ({ currentUser }) => {
  const allStudents = getStudents();
  const allRecords = getAttendanceRecords();

  const currentStudent =
    allStudents.find((s) => s.id === currentUser.studentId) || allStudents[0];

  const studentRecords = allRecords.filter((r) => r.studentId === currentStudent.id);

  const total = studentRecords.length;
  const hadir = studentRecords.filter((r) => r.status === 'Hadir').length;
  const izin = studentRecords.filter((r) => r.status === 'Izin').length;
  const sakit = studentRecords.filter((r) => r.status === 'Sakit').length;
  const alpa = studentRecords.filter((r) => r.status === 'Alpa').length;
  const percentage = total > 0 ? Math.round((hadir / total) * 100) : 100;

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Student Profile Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            {currentStudent.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{currentStudent.name}</h2>
            <div className="text-xs text-slate-500 mt-0.5">
              NISN: <span className="font-semibold text-slate-700">{currentStudent.nisn}</span> • Kelas:{' '}
              <span className="font-semibold text-slate-700">{currentStudent.className}</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Wali Murid: {currentStudent.parentName}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Nilai Disiplin Presensi</div>
            <div className="text-2xl font-black text-blue-600">{percentage}%</div>
          </div>
          <Award className="w-8 h-8 text-amber-500" />
        </div>
      </div>

      {/* Metric Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-emerald-600 uppercase">Hadir</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{hadir} Kali</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Mengikuti pelajaran</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-amber-600 uppercase">Izin</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{izin} Kali</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Izin resmi disetujui</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-sky-600 uppercase">Sakit</div>
          <div className="text-2xl font-bold text-sky-700 mt-1">{sakit} Kali</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Dengan surat dokter</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-rose-600 uppercase">Alpa</div>
          <div className="text-2xl font-bold text-rose-700 mt-1">{alpa} Kali</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Tanpa keterangan</div>
        </div>
      </div>

      {/* Student Personal History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Riwayat Kehadiran Mandiri Siswa
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Mata Pelajaran</th>
                <th className="py-2.5 px-3">Jam Belajar</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3">Catatan Guru</th>
                <th className="py-2.5 px-3">Guru Pengampu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Belum ada riwayat absensi.
                  </td>
                </tr>
              ) : (
                studentRecords.map((r) => (
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
                    <td className="py-3 px-3 text-slate-600">{r.notes || '-'}</td>
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
