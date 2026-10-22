import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  BookOpen,
  Calendar,
  GraduationCap,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  School,
  Sparkles,
} from 'lucide-react';
import {
  SchoolClass,
  Student,
  Teacher,
  ScheduleSession,
  User,
} from '../types';
import {
  addClass,
  addSchedule,
  addStudent,
  addTeacher,
  deleteStudent,
  getAttendanceRecords,
  getClasses,
  getSchedules,
  getStudents,
  getTeachers,
  updateStudent,
} from '../services/storage';

interface Props {
  currentUser: User;
  subTab?: string;
}

export const AdminManagement: React.FC<Props> = ({ currentUser, subTab = 'students' }) => {
  const [activeSubTab, setActiveSubTab] = useState<'students' | 'teachers' | 'classes' | 'schedules'>(
    subTab as any
  );

  const classes = getClasses();
  const teachers = getTeachers();
  const students = getStudents();
  const schedules = getSchedules();

  // Search filter
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');

  // Add student modal
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    nisn: '',
    gender: 'L' as 'L' | 'P',
    classId: classes[0]?.id || '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    address: '',
  });

  // Add teacher modal
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    nip: '',
    subject: '',
    phone: '',
    email: '',
    isHomeroom: false,
    homeroomClassId: '',
  });

  // Add class modal
  const [showAddClass, setShowAddClass] = useState(false);
  const [newClass, setNewClass] = useState({
    name: '',
    grade: 10,
    academicYear: '2024/2025 - Semester Genap',
    homeroomTeacherId: teachers[0]?.id || '',
  });

  // Add schedule modal
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    classId: classes[0]?.id || '',
    subjectName: '',
    teacherId: teachers[0]?.id || '',
    day: 'Senin',
    timeSlot: '07:30 - 09:00',
    room: 'Ruang 101',
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.nisn) return;
    const targetClass = classes.find((c) => c.id === newStudent.classId);
    addStudent({
      ...newStudent,
      className: targetClass?.name || 'X IPA 1',
    });
    setShowAddStudent(false);
    setNewStudent({
      name: '',
      nisn: '',
      gender: 'L',
      classId: classes[0]?.id || '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      address: '',
    });
  };

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.name || !newTeacher.nip) return;
    addTeacher(newTeacher);
    setShowAddTeacher(false);
    setNewTeacher({
      name: '',
      nip: '',
      subject: '',
      phone: '',
      email: '',
      isHomeroom: false,
      homeroomClassId: '',
    });
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.name) return;
    const teacher = teachers.find((t) => t.id === newClass.homeroomTeacherId);
    addClass({
      ...newClass,
      homeroomTeacherName: teacher?.name || '-',
      studentCount: 0,
    });
    setShowAddClass(false);
    setNewClass({
      name: '',
      grade: 10,
      academicYear: '2024/2025 - Semester Genap',
      homeroomTeacherId: teachers[0]?.id || '',
    });
  };

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchedule.subjectName) return;
    const cls = classes.find((c) => c.id === newSchedule.classId);
    const teacher = teachers.find((t) => t.id === newSchedule.teacherId);
    addSchedule({
      ...newSchedule,
      className: cls?.name || '-',
      teacherName: teacher?.name || '-',
    });
    setShowAddSchedule(false);
    setNewSchedule({
      classId: classes[0]?.id || '',
      subjectName: '',
      teacherId: teachers[0]?.id || '',
      day: 'Senin',
      timeSlot: '07:30 - 09:00',
      room: 'Ruang 101',
    });
  };

  const filteredStudents = students.filter((s) => {
    if (filterClass !== 'all' && s.classId !== filterClass) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.nisn.toLowerCase().includes(q) ||
        s.parentName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Sub tabs navigation */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex flex-wrap items-center gap-1">
        <button
          onClick={() => setActiveSubTab('students')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'students'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Data Siswa ({students.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('teachers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'teachers'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Data Guru ({teachers.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('classes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'classes'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <School className="w-4 h-4" />
          <span>Data Kelas ({classes.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('schedules')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'schedules'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Jadwal Pelajaran ({schedules.length})</span>
        </button>
      </div>

      {/* 1. STUDENTS TAB */}
      {activeSubTab === 'students' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari siswa atau NISN..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
              >
                <option value="all">Semua Kelas</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowAddStudent(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Siswa Baru</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3">Nama Siswa</th>
                    <th className="py-2.5 px-3">NISN</th>
                    <th className="py-2.5 px-3">Kelas</th>
                    <th className="py-2.5 px-3">L/P</th>
                    <th className="py-2.5 px-3">Nama Wali Murid</th>
                    <th className="py-2.5 px-3">No. Kontak Ortu</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((s, i) => (
                    <tr key={s.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 text-center text-slate-400 font-medium">{i + 1}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{s.name}</td>
                      <td className="py-3 px-3 text-slate-600">{s.nisn}</td>
                      <td className="py-3 px-3 font-medium text-blue-700">{s.className}</td>
                      <td className="py-3 px-3">{s.gender}</td>
                      <td className="py-3 px-3 text-slate-700">{s.parentName}</td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{s.parentPhone}</td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => {
                            if (confirm(`Hapus data siswa ${s.name}?`)) {
                              deleteStudent(s.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. TEACHERS TAB */}
      {activeSubTab === 'teachers' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="text-xs font-bold text-slate-800">
              Daftar Tenaga Pengajar & Wali Kelas
            </div>
            <button
              onClick={() => setShowAddTeacher(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Guru Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {teachers.map((t) => (
              <div key={t.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                    {t.name.split(' ')[0][0]}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{t.name}</div>
                    <div className="text-[11px] text-slate-500">NIP: {t.nip}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs space-y-1">
                  <div>
                    <span className="text-slate-400">Mapel:</span> <strong>{t.subject}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Kontak:</span> {t.phone}
                  </div>
                  <div>
                    <span className="text-slate-400">Peran:</span>{' '}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        t.isHomeroom
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t.isHomeroom ? 'Wali Kelas' : 'Guru Pengajar'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CLASSES TAB */}
      {activeSubTab === 'classes' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="text-xs font-bold text-slate-800">
              Daftar Rombongan Belajar (Kelas)
            </div>
            <button
              onClick={() => setShowAddClass(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kelas</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {classes.map((c) => {
              const count = students.filter((s) => s.classId === c.id).length;
              return (
                <div key={c.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-slate-900">{c.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                      Tingkat {c.grade}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 space-y-1">
                    <div>Tahun Ajaran: <strong>{c.academicYear}</strong></div>
                    <div>Wali Kelas: <strong>{c.homeroomTeacherName}</strong></div>
                    <div>Jumlah Siswa: <strong>{count} Orang</strong></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. SCHEDULES TAB */}
      {activeSubTab === 'schedules' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="text-xs font-bold text-slate-800">
              Jadwal Sesi Mata Pelajaran
            </div>
            <button
              onClick={() => setShowAddSchedule(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Jadwal Baru</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Hari & Jam</th>
                    <th className="py-2.5 px-3">Kelas</th>
                    <th className="py-2.5 px-3">Mata Pelajaran</th>
                    <th className="py-2.5 px-3">Ruang</th>
                    <th className="py-2.5 px-3">Guru Pengampu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schedules.map((sch) => (
                    <tr key={sch.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{sch.day}</div>
                        <div className="text-[10px] text-slate-400">{sch.timeSlot}</div>
                      </td>
                      <td className="py-3 px-3 font-bold text-blue-700">{sch.className}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{sch.subjectName}</td>
                      <td className="py-3 px-3 text-slate-600">{sch.room}</td>
                      <td className="py-3 px-3 text-slate-700">{sch.teacherName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Student */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateStudent}
            className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 text-xs space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Tambah Data Siswa Baru</h3>
              <button
                type="button"
                onClick={() => setShowAddStudent(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block font-semibold mb-1">Nama Lengkap Siswa *</label>
              <input
                type="text"
                required
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-2 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold mb-1">NISN *</label>
                <input
                  type="text"
                  required
                  value={newStudent.nisn}
                  onChange={(e) => setNewStudent({ ...newStudent, nisn: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Jenis Kelamin</label>
                <select
                  value={newStudent.gender}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, gender: e.target.value as 'L' | 'P' })
                  }
                  className="w-full border border-slate-300 rounded-xl p-2 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Pilih Kelas</label>
              <select
                value={newStudent.classId}
                onChange={(e) => setNewStudent({ ...newStudent, classId: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-2 focus:ring-1 focus:ring-blue-500"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Nama Orang Tua / Wali *</label>
              <input
                type="text"
                required
                value={newStudent.parentName}
                onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-2 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">No. WhatsApp / HP Ortu (Notifikasi) *</label>
              <input
                type="text"
                required
                placeholder="0812xxxxxxxx"
                value={newStudent.parentPhone}
                onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-2 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddStudent(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl cursor-pointer"
              >
                Simpan Siswa
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Add Teacher */}
      {showAddTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateTeacher}
            className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 text-xs space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Tambah Guru Baru</h3>
              <button
                type="button"
                onClick={() => setShowAddTeacher(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block font-semibold mb-1">Nama Lengkap & Gelar *</label>
              <input
                type="text"
                required
                value={newTeacher.name}
                onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold mb-1">NIP *</label>
                <input
                  type="text"
                  required
                  value={newTeacher.nip}
                  onChange={(e) => setNewTeacher({ ...newTeacher, nip: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Mata Pelajaran *</label>
                <input
                  type="text"
                  required
                  value={newTeacher.subject}
                  onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">No. HP / Telepon</label>
              <input
                type="text"
                value={newTeacher.phone}
                onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-2"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddTeacher(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
              >
                Simpan Guru
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Add Class */}
      {showAddClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateClass}
            className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 text-xs space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Tambah Kelas Baru</h3>
              <button
                type="button"
                onClick={() => setShowAddClass(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block font-semibold mb-1">Nama Kelas (contoh: XII MIPA 2) *</label>
              <input
                type="text"
                required
                value={newClass.name}
                onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold mb-1">Tingkat</label>
                <select
                  value={newClass.grade}
                  onChange={(e) => setNewClass({ ...newClass, grade: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-xl p-2"
                >
                  <option value={10}>Kelas 10</option>
                  <option value={11}>Kelas 11</option>
                  <option value={12}>Kelas 12</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Pilih Wali Kelas</label>
                <select
                  value={newClass.homeroomTeacherId}
                  onChange={(e) =>
                    setNewClass({ ...newClass, homeroomTeacherId: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-xl p-2"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddClass(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
              >
                Simpan Kelas
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Add Schedule */}
      {showAddSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateSchedule}
            className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 text-xs space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Tambah Jadwal Pelajaran</h3>
              <button
                type="button"
                onClick={() => setShowAddSchedule(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block font-semibold mb-1">Mata Pelajaran *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Kimia Dasar / Sejarah Indonesia"
                value={newSchedule.subjectName}
                onChange={(e) => setNewSchedule({ ...newSchedule, subjectName: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold mb-1">Kelas</label>
                <select
                  value={newSchedule.classId}
                  onChange={(e) => setNewSchedule({ ...newSchedule, classId: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Guru Pengajar</label>
                <select
                  value={newSchedule.teacherId}
                  onChange={(e) => setNewSchedule({ ...newSchedule, teacherId: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-semibold mb-1">Hari</label>
                <select
                  value={newSchedule.day}
                  onChange={(e) => setNewSchedule({ ...newSchedule, day: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2"
                >
                  <option value="Senin">Senin</option>
                  <option value="Selasa">Selasa</option>
                  <option value="Rabu">Rabu</option>
                  <option value="Kamis">Kamis</option>
                  <option value="Jumat">Jumat</option>
                  <option value="Sabtu">Sabtu</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Jam Sesi</label>
                <input
                  type="text"
                  value={newSchedule.timeSlot}
                  onChange={(e) => setNewSchedule({ ...newSchedule, timeSlot: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Ruangan</label>
                <input
                  type="text"
                  value={newSchedule.room}
                  onChange={(e) => setNewSchedule({ ...newSchedule, room: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddSchedule(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
              >
                Simpan Jadwal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
