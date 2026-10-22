import React, { useState } from 'react';
import {
  Download,
  Filter,
  Search,
  Calendar,
  CheckCircle,
  FileSpreadsheet,
  AlertCircle,
  Users,
} from 'lucide-react';
import { AttendanceRecord, Role } from '../types';
import { getAttendanceRecords, getClasses, getStudents } from '../services/storage';

interface Props {
  userRole: Role;
  filterClassId?: string;
  filterStudentId?: string;
}

export const AttendanceRecap: React.FC<Props> = ({
  userRole,
  filterClassId,
  filterStudentId,
}) => {
  const classes = getClasses();
  const allStudents = getStudents();
  const records = getAttendanceRecords();

  const [selectedClass, setSelectedClass] = useState<string>(filterClassId || 'all');
  const [selectedStudent, setSelectedStudent] = useState<string>(filterStudentId || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter students based on selected class
  const classStudents =
    selectedClass === 'all'
      ? allStudents
      : allStudents.filter((s) => s.classId === selectedClass);

  // Filter records
  const filteredRecords = records.filter((rec) => {
    if (selectedClass !== 'all' && rec.classId !== selectedClass) return false;
    if (selectedStudent !== 'all' && rec.studentId !== selectedStudent) return false;
    if (selectedStatus !== 'all' && rec.status !== selectedStatus) return false;
    if (startDate && rec.date < startDate) return false;
    if (endDate && rec.date > endDate) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = rec.studentName.toLowerCase().includes(q);
      const matchSubject = rec.subjectName.toLowerCase().includes(q);
      const matchNisn = rec.nisn.toLowerCase().includes(q);
      if (!matchName && !matchSubject && !matchNisn) return false;
    }
    return true;
  });

  // Export CSV function (FR-14)
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      alert('Tidak ada data absensi untuk diekspor sesuai filter yang dipilih.');
      return;
    }

    const headers = [
      'No',
      'Tanggal',
      'NISN',
      'Nama Siswa',
      'Kelas',
      'Mata Pelajaran',
      'Jam Sesi',
      'Status Kehadiran',
      'Keterangan',
      'Dicatat Oleh',
      'Waktu Catat',
      'Diubah Oleh',
      'Alasan Perubahan',
      'Status Sinkronisasi',
    ];

    const rows = filteredRecords.map((r, i) => [
      i + 1,
      r.date,
      `"${r.nisn}"`,
      `"${r.studentName}"`,
      `"${r.className}"`,
      `"${r.subjectName}"`,
      `"${r.timeSlot}"`,
      r.status,
      `"${r.notes || '-'}"`,
      `"${r.recordedBy}"`,
      r.recordedAt,
      `"${r.updatedBy || '-'}"`,
      `"${r.changeReason || '-'}"`,
      r.syncStatus,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Rekap_Absensi_Siswa_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics summary
  const total = filteredRecords.length;
  const hadir = filteredRecords.filter((r) => r.status === 'Hadir').length;
  const izin = filteredRecords.filter((r) => r.status === 'Izin').length;
  const sakit = filteredRecords.filter((r) => r.status === 'Sakit').length;
  const alpa = filteredRecords.filter((r) => r.status === 'Alpa').length;
  const percentage = total > 0 ? Math.round((hadir / total) * 100) : 0;

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header & Export Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <span>Rekap & Laporan Kehadiran Siswa</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Filter rekapan absensi berdasarkan kelas, periode tanggal, dan ekspor ke format Excel/CSV.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Unduh Laporan (CSV / Excel)</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Tingkat Hadir</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{percentage}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{hadir} dari {total} sesi</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-emerald-600 uppercase">Hadir</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{hadir}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Tepat waktu</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-amber-600 uppercase">Izin</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{izin}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Dengan konfirmasi</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-sky-600 uppercase">Sakit</div>
          <div className="text-2xl font-bold text-sky-700 mt-1">{sakit}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Surat dokter / keterangan</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="text-[11px] font-semibold text-rose-600 uppercase">Alpa</div>
          <div className="text-2xl font-bold text-rose-700 mt-1">{alpa}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Tanpa kabar</div>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Filter className="w-4 h-4 text-slate-500" />
          <span>Filter Data Absensi</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Class selector */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Kelas</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedStudent('all');
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Student selector */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Siswa</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Siswa</option>
              {classStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status selector */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Status Kehadiran</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="Hadir">Hadir</option>
              <option value="Izin">Izin</option>
              <option value="Sakit">Sakit</option>
              <option value="Alpa">Alpa</option>
            </select>
          </div>

          {/* Date from */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Date to */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Search input */}
        <div className="pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama siswa, NISN, atau mata pelajaran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Table Results */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            Menampilkan <strong>{filteredRecords.length}</strong> catatan kehadiran
          </span>
          {(selectedClass !== 'all' ||
            selectedStudent !== 'all' ||
            selectedStatus !== 'all' ||
            startDate ||
            endDate ||
            searchQuery) && (
            <button
              onClick={() => {
                setSelectedClass('all');
                setSelectedStudent('all');
                setSelectedStatus('all');
                setStartDate('');
                setEndDate('');
                setSearchQuery('');
              }}
              className="text-blue-600 hover:text-blue-800 text-xs font-medium cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-3">Tanggal / Waktu</th>
                <th className="py-2.5 px-3">Siswa & Kelas</th>
                <th className="py-2.5 px-3">Mata Pelajaran</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3">Keterangan / Alasan Perubahan</th>
                <th className="py-2.5 px-3">Penginput</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    Tidak ada rekaman absensi yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, i) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 text-center text-slate-400 font-medium">{i + 1}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{r.date}</div>
                      <div className="text-[10px] text-slate-400">{r.timeSlot}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{r.studentName}</div>
                      <div className="text-[10px] text-slate-500">{r.className} • NISN: {r.nisn}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {r.subjectName}
                    </td>
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
                    <td className="py-3 px-3">
                      {r.notes ? (
                        <div className="text-slate-800 font-medium">{r.notes}</div>
                      ) : (
                        <div className="text-slate-400 italic">-</div>
                      )}
                      {r.changeReason && (
                        <div className="text-[10px] text-blue-600 mt-0.5">
                          Alasan ubah: {r.changeReason} ({r.updatedBy})
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-700 text-xs">{r.recordedBy}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(r.recordedAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
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
