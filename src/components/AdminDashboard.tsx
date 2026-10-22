import React from 'react';
import {
  Users,
  GraduationCap,
  Calendar,
  School,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  TrendingUp,
  FileText,
  Clock,
} from 'lucide-react';
import {
  getAttendanceRecords,
  getClasses,
  getSchedules,
  getStudents,
  getTeachers,
  resetToSeedData,
} from '../services/storage';

interface Props {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<Props> = ({ onNavigateTab }) => {
  const classes = getClasses();
  const teachers = getTeachers();
  const students = getStudents();
  const schedules = getSchedules();
  const records = getAttendanceRecords();

  const totalRecords = records.length;
  const hadir = records.filter((r) => r.status === 'Hadir').length;
  const izin = records.filter((r) => r.status === 'Izin').length;
  const sakit = records.filter((r) => r.status === 'Sakit').length;
  const alpa = records.filter((r) => r.status === 'Alpa').length;

  const attendanceRate = totalRecords > 0 ? Math.round((hadir / totalRecords) * 100) : 100;

  const handleResetData = () => {
    if (confirm('Kembalikan semua data ke sampel awal sekolah SMA N 1 Nusantara?')) {
      resetToSeedData();
      alert('Data sistem telah direset ke data sampel awal.');
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-5 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2">
              <School className="w-3.5 h-3.5" />
              <span>Portal Tata Usaha & Administrator Sekolah</span>
            </div>
            <h2 className="text-xl font-bold">
              Selamat Datang di Sistem Absensi SMA Negeri 1 Nusantara
            </h2>
            <p className="text-xs text-blue-200 mt-1 max-w-xl">
              Memfasilitasi pencatatan kehadiran siswa digital, pemantauan waktu nyata, mode offline PWA, dan rekap otomatis bagi guru dan orang tua.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetData}
              className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset data demo ke pengaturan awal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Total Siswa</div>
            <div className="text-xl font-extrabold text-slate-900">{students.length} Orang</div>
            <div className="text-[10px] text-slate-500">Terdaftar aktif</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Tenaga Guru</div>
            <div className="text-xl font-extrabold text-slate-900">{teachers.length} Guru</div>
            <div className="text-[10px] text-slate-500">Pengajar & Wali</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <School className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Rombel Kelas</div>
            <div className="text-xl font-extrabold text-slate-900">{classes.length} Kelas</div>
            <div className="text-[10px] text-slate-500">{schedules.length} Sesi Jadwal</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Tingkat Hadir Sekolah</div>
            <div className="text-xl font-extrabold text-blue-600">{attendanceRate}%</div>
            <div className="text-[10px] text-slate-500">Target kelengkapan: 98%</div>
          </div>
        </div>
      </div>

      {/* Aggregate Attendance Breakdown */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
          Statistik Presensi Keseluruhan
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="text-xs font-bold text-emerald-800">Total Hadir</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{hadir}</div>
            <div className="text-[10px] text-emerald-600 mt-0.5">Siswa hadir di kelas</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
            <div className="text-xs font-bold text-amber-800">Total Izin</div>
            <div className="text-2xl font-black text-amber-700 mt-1">{izin}</div>
            <div className="text-[10px] text-amber-600 mt-0.5">Disetujui sekolah</div>
          </div>
          <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
            <div className="text-xs font-bold text-sky-800">Total Sakit</div>
            <div className="text-2xl font-black text-sky-700 mt-1">{sakit}</div>
            <div className="text-[10px] text-sky-600 mt-0.5">Surat keterangan dokter</div>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
            <div className="text-xs font-bold text-rose-800">Total Alpa</div>
            <div className="text-2xl font-black text-rose-700 mt-1">{alpa}</div>
            <div className="text-[10px] text-rose-600 mt-0.5">Tanpa konfirmasi</div>
          </div>
        </div>
      </div>

      {/* Class comparison & quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Class Overview List */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Ringkasan Kehadiran Tiap Kelas
            </h3>
            <button
              onClick={() => onNavigateTab('recap')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              Lihat Rekap Lengkap →
            </button>
          </div>

          <div className="space-y-2">
            {classes.map((cls) => {
              const clsRecords = records.filter((r) => r.classId === cls.id);
              const clsHadir = clsRecords.filter((r) => r.status === 'Hadir').length;
              const clsRate =
                clsRecords.length > 0 ? Math.round((clsHadir / clsRecords.length) * 100) : 100;
              const studentCount = students.filter((s) => s.classId === cls.id).length;

              return (
                <div
                  key={cls.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{cls.name}</div>
                    <div className="text-slate-500 text-[11px]">
                      Wali: {cls.homeroomTeacherName} • {studentCount} Siswa
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-28 bg-slate-200 rounded-full h-2 overflow-hidden hidden sm:block">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${clsRate}%` }}
                      />
                    </div>
                    <span className="font-bold text-slate-800">{clsRate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Aksi Cepat Admin
          </h3>

          <div className="space-y-2">
            <button
              onClick={() => onNavigateTab('manage')}
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left text-xs font-semibold text-slate-800 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Kelola Siswa, Guru & Jadwal</span>
              <Users className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateTab('recap')}
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left text-xs font-semibold text-slate-800 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Ekspor Rekap Laporan (CSV)</span>
              <FileText className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateTab('audit')}
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left text-xs font-semibold text-slate-800 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Lihat Log Perubahan Status Absensi</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
