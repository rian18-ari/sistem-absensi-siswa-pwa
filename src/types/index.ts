export type Role = 'admin' | 'guru' | 'wali_kelas' | 'orang_tua' | 'siswa';

export type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';

export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'failed' | 'conflict';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  teacherId?: string; // If guru or wali_kelas
  homeroomClassId?: string; // If wali_kelas
  parentId?: string; // If orang_tua
  studentId?: string; // If siswa
  linkedStudentIds?: string[]; // If orang_tua with multiple children
}

export interface Student {
  id: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  classId: string;
  className: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  address?: string;
  photoUrl?: string;
}

export interface Teacher {
  id: string;
  nip: string;
  name: string;
  subject: string;
  phone: string;
  email: string;
  isHomeroom?: boolean;
  homeroomClassId?: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  grade: number; // 10, 11, 12
  academicYear: string;
  homeroomTeacherId: string;
  homeroomTeacherName: string;
  studentCount?: number;
}

export interface ScheduleSession {
  id: string;
  classId: string;
  className: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  day: string; // 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
  timeSlot: string; // e.g. "07:30 - 09:00"
  room: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  nisn: string;
  classId: string;
  className: string;
  scheduleId: string;
  subjectName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  status: AttendanceStatus;
  notes?: string;
  recordedBy: string; // Teacher name
  recordedById: string;
  recordedAt: string; // ISO
  updatedBy?: string;
  updatedAt?: string;
  changeReason?: string;
  syncStatus: SyncStatus;
  isOfflineCreated?: boolean;
  serverVersion?: number;
  localVersion?: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  details: string;
  studentName?: string;
  className?: string;
}

export interface ParentNotification {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  parentName: string;
  parentPhone: string;
  date: string;
  subjectName: string;
  status: AttendanceStatus;
  notes?: string;
  channel: 'WhatsApp' | 'SMS';
  sentAt: string;
  deliveryStatus: 'Terkirim' | 'Pending' | 'Gagal';
  messageText: string;
}

export interface SyncQueueItem {
  id: string;
  attendanceId: string;
  data: AttendanceRecord;
  action: 'create' | 'update';
  timestamp: string;
  attempts: number;
  status: SyncStatus;
  errorMessage?: string;
}

export interface SyncConflict {
  attendanceId: string;
  studentName: string;
  date: string;
  subjectName: string;
  localRecord: AttendanceRecord;
  serverRecord: AttendanceRecord;
}
