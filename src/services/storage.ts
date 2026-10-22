import {
  AttendanceRecord,
  AttendanceStatus,
  AuditLog,
  ParentNotification,
  Role,
  SchoolClass,
  ScheduleSession,
  Student,
  SyncConflict,
  SyncQueueItem,
  Teacher,
  User,
} from '../types';
import {
  INITIAL_ATTENDANCE,
  INITIAL_CLASSES,
  INITIAL_NOTIFICATIONS,
  INITIAL_SCHEDULES,
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_USERS,
} from './mockData';

const STORAGE_KEYS = {
  CLASSES: 'absensi_classes_v1',
  TEACHERS: 'absensi_teachers_v1',
  STUDENTS: 'absensi_students_v1',
  SCHEDULES: 'absensi_schedules_v1',
  ATTENDANCE: 'absensi_records_v1',
  SERVER_ATTENDANCE: 'absensi_server_shadow_v1', // Shadows server state for conflict detection
  AUDIT_LOGS: 'absensi_audit_logs_v1',
  NOTIFICATIONS: 'absensi_notifications_v1',
  SYNC_QUEUE: 'absensi_sync_queue_v1',
  LAST_PRELOAD_TIME: 'absensi_last_preload_time_v1',
  SIMULATED_OFFLINE: 'absensi_simulated_offline_v1',
  CURRENT_USER: 'absensi_current_user_v1',
};

// Listeners for reactive updates
type StorageListener = () => void;
const listeners = new Set<StorageListener>();

export function subscribeToStorage(listener: StorageListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error(e);
    }
  });
}

// Initializer
export function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TEACHERS)) {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(INITIAL_TEACHERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SCHEDULES)) {
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(INITIAL_SCHEDULES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
    localStorage.setItem(STORAGE_KEYS.SERVER_ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE)) {
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LAST_PRELOAD_TIME)) {
    localStorage.setItem(STORAGE_KEYS.LAST_PRELOAD_TIME, new Date().toISOString());
  }
  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    const initialLogs: AuditLog[] = [
      {
        id: 'log-1',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        userId: 'u-guru1',
        userName: 'Dra. Sri Wahyuni, M.Pd.',
        userRole: 'guru',
        action: 'Absensi Kelas Dimulai',
        details: 'Mencatat absensi sesi Matematika Wajib kelas X IPA 1',
        className: 'X IPA 1',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialLogs));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[1])); // Default to Guru
  }
}

// Network simulation status
export function isSimulatedOffline(): boolean {
  return localStorage.getItem(STORAGE_KEYS.SIMULATED_OFFLINE) === 'true';
}

export function setSimulatedOffline(val: boolean) {
  localStorage.setItem(STORAGE_KEYS.SIMULATED_OFFLINE, val ? 'true' : 'false');
  notifyListeners();
}

export function getEffectiveOnlineStatus(): boolean {
  if (isSimulatedOffline()) return false;
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

// Current User & Auth
export function getCurrentUser(): User {
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      // fallback
    }
  }
  return INITIAL_USERS[1];
}

export function setCurrentUser(user: User) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  addAuditLog(user.id, user.name, user.role, 'Ganti Akun / Login', `Login sebagai ${user.name} (${user.role})`);
  notifyListeners();
}

export function getAllUsers(): User[] {
  return INITIAL_USERS;
}

// Data Getters
export function getClasses(): SchoolClass[] {
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.CLASSES);
  return raw ? JSON.parse(raw) : INITIAL_CLASSES;
}

export function getTeachers(): Teacher[] {
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.TEACHERS);
  return raw ? JSON.parse(raw) : INITIAL_TEACHERS;
}

export function getStudents(): Student[] {
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  return raw ? JSON.parse(raw) : INITIAL_STUDENTS;
}

export function getSchedules(): ScheduleSession[] {
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
  return raw ? JSON.parse(raw) : INITIAL_SCHEDULES;
}

export function getAttendanceRecords(): AttendanceRecord[] {
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
  return raw ? JSON.parse(raw) : [];
}

export function getServerAttendanceRecords(): AttendanceRecord[] {
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.SERVER_ATTENDANCE);
  return raw ? JSON.parse(raw) : [];
}

export function getAuditLogs(): AuditLog[] {
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
  return raw ? JSON.parse(raw) : [];
}

export function getNotifications(): ParentNotification[] {
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  return raw ? JSON.parse(raw) : [];
}

export function getSyncQueue(): SyncQueueItem[] {
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
  return raw ? JSON.parse(raw) : [];
}

export function getLastPreloadTime(): string {
  initStorage();
  return localStorage.getItem(STORAGE_KEYS.LAST_PRELOAD_TIME) || new Date().toISOString();
}

export function refreshPreloadedData() {
  localStorage.setItem(STORAGE_KEYS.LAST_PRELOAD_TIME, new Date().toISOString());
  notifyListeners();
}

// Audit Log Helper
export function addAuditLog(
  userId: string,
  userName: string,
  userRole: Role,
  action: string,
  details: string,
  studentName?: string,
  className?: string
) {
  const logs = getAuditLogs();
  const newLog: AuditLog = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    timestamp: new Date().toISOString(),
    userId,
    userName,
    userRole,
    action,
    details,
    studentName,
    className,
  };
  logs.unshift(newLog);
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 200)));
  notifyListeners();
}

// Duplicate checker (FR-08, FR-11, FR-PWA-07)
export function checkDuplicateSession(
  studentId: string,
  date: string,
  scheduleId: string,
  excludeRecordId?: string
): AttendanceRecord | null {
  const records = getAttendanceRecords();
  return (
    records.find(
      (r) =>
        r.studentId === studentId &&
        r.date === date &&
        r.scheduleId === scheduleId &&
        r.id !== excludeRecordId
    ) || null
  );
}

// Attendance input & Batch Submission
export function saveAttendanceRecords(
  newRecords: Omit<AttendanceRecord, 'id' | 'syncStatus' | 'serverVersion' | 'localVersion'>[],
  currentUser: User
): { success: boolean; savedCount: number; message: string; conflicts?: SyncConflict[] } {
  const isOnline = getEffectiveOnlineStatus();
  const allRecords = getAttendanceRecords();
  const serverRecords = getServerAttendanceRecords();
  const queue = getSyncQueue();
  const notifications = getNotifications();

  let savedCount = 0;

  for (const item of newRecords) {
    const existingIndex = allRecords.findIndex(
      (r) =>
        r.studentId === item.studentId &&
        r.date === item.date &&
        r.scheduleId === item.scheduleId
    );

    const recordId =
      existingIndex >= 0 ? allRecords[existingIndex].id : 'att-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);

    const fullRecord: AttendanceRecord = {
      ...item,
      id: recordId,
      syncStatus: isOnline ? 'synced' : 'pending',
      isOfflineCreated: !isOnline,
      serverVersion: 1,
      localVersion: (allRecords[existingIndex]?.localVersion || 0) + 1,
    };

    if (existingIndex >= 0) {
      allRecords[existingIndex] = fullRecord;
    } else {
      allRecords.push(fullRecord);
    }
    savedCount++;

    if (isOnline) {
      // Sync immediately to server shadow
      const serverIdx = serverRecords.findIndex((r) => r.id === recordId);
      if (serverIdx >= 0) {
        serverRecords[serverIdx] = { ...fullRecord, syncStatus: 'synced' };
      } else {
        serverRecords.push({ ...fullRecord, syncStatus: 'synced' });
      }

      // If absent (Izin / Sakit / Alpa), automatically send parent notification
      if (item.status !== 'Hadir') {
        const student = getStudents().find((s) => s.id === item.studentId);
        if (student) {
          const notif: ParentNotification = {
            id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            studentId: student.id,
            studentName: student.name,
            className: item.className,
            parentName: student.parentName,
            parentPhone: student.parentPhone,
            date: item.date,
            subjectName: item.subjectName,
            status: item.status,
            notes: item.notes,
            channel: 'WhatsApp',
            sentAt: new Date().toISOString(),
            deliveryStatus: 'Terkirim',
            messageText: `[SMA N 1 Nusantara] Yth. Bpk/Ibu ${student.parentName}, ananda ${student.name} (${item.className}) tercatat berstatus "${item.status}" pada mata pelajaran ${item.subjectName} tanggal ${item.date}.${item.notes ? ` Keterangan: ${item.notes}.` : ''}`,
          };
          notifications.unshift(notif);
        }
      }
    } else {
      // Queue for later sync
      const queueIndex = queue.findIndex((q) => q.attendanceId === recordId);
      const queueItem: SyncQueueItem = {
        id: 'q-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        attendanceId: recordId,
        data: fullRecord,
        action: existingIndex >= 0 ? 'update' : 'create',
        timestamp: new Date().toISOString(),
        attempts: 0,
        status: 'pending',
      };
      if (queueIndex >= 0) {
        queue[queueIndex] = queueItem;
      } else {
        queue.push(queueItem);
      }
    }
  }

  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(allRecords));
  localStorage.setItem(STORAGE_KEYS.SERVER_ATTENDANCE, JSON.stringify(serverRecords));
  localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));

  addAuditLog(
    currentUser.id,
    currentUser.name,
    currentUser.role,
    isOnline ? 'Pengisian Absensi (Online)' : 'Pengisian Absensi (Offline)',
    `Tercatat ${savedCount} siswa pada kelas ${newRecords[0]?.className} - ${newRecords[0]?.subjectName} (${isOnline ? 'Tersinkron' : 'Disimpan Lokal'})`,
    undefined,
    newRecords[0]?.className
  );

  notifyListeners();
  return {
    success: true,
    savedCount,
    message: isOnline
      ? `Berhasil menyimpan dan mensinkronkan ${savedCount} data absensi.`
      : `${savedCount} data absensi tersimpan di perangkat (Mode Offline). Menunggu koneksi untuk sinkronisasi.`,
  };
}

// Update single attendance record with reason (FR-10, FR-16)
export function updateAttendanceWithReason(
  attendanceId: string,
  newStatus: AttendanceStatus,
  changeReason: string,
  notes: string | undefined,
  currentUser: User
): boolean {
  const records = getAttendanceRecords();
  const index = records.findIndex((r) => r.id === attendanceId);
  if (index < 0) return false;

  const prev = records[index];
  const isOnline = getEffectiveOnlineStatus();

  const updated: AttendanceRecord = {
    ...prev,
    status: newStatus,
    notes: notes !== undefined ? notes : prev.notes,
    changeReason,
    updatedBy: currentUser.name,
    updatedAt: new Date().toISOString(),
    syncStatus: isOnline ? 'synced' : 'pending',
    localVersion: (prev.localVersion || 1) + 1,
  };

  records[index] = updated;
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));

  if (isOnline) {
    const serverRecords = getServerAttendanceRecords();
    const serverIdx = serverRecords.findIndex((r) => r.id === attendanceId);
    if (serverIdx >= 0) {
      serverRecords[serverIdx] = updated;
      localStorage.setItem(STORAGE_KEYS.SERVER_ATTENDANCE, JSON.stringify(serverRecords));
    }
  } else {
    const queue = getSyncQueue();
    queue.push({
      id: 'q-' + Date.now(),
      attendanceId,
      data: updated,
      action: 'update',
      timestamp: new Date().toISOString(),
      attempts: 0,
      status: 'pending',
    });
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
  }

  addAuditLog(
    currentUser.id,
    currentUser.name,
    currentUser.role,
    'Perubahan Status Absensi',
    `Mengubah status ${prev.studentName} dari "${prev.status}" menjadi "${newStatus}". Alasan: ${changeReason}`,
    prev.studentName,
    prev.className
  );

  notifyListeners();
  return true;
}

// Sync execution (FR-PWA-04, FR-PWA-05, FR-PWA-06, FR-PWA-08)
export async function syncPendingQueue(): Promise<{
  syncedCount: number;
  conflicts: SyncConflict[];
  errors: number;
}> {
  const queue = getSyncQueue();
  if (queue.length === 0) return { syncedCount: 0, conflicts: [], errors: 0 };

  const isOnline = getEffectiveOnlineStatus();
  if (!isOnline) {
    throw new Error('Tidak dapat melakukan sinkronisasi dalam mode offline.');
  }

  const allRecords = getAttendanceRecords();
  const serverRecords = getServerAttendanceRecords();
  const notifications = getNotifications();
  const conflicts: SyncConflict[] = [];
  let syncedCount = 0;
  let errors = 0;

  const remainingQueue: SyncQueueItem[] = [];

  for (const item of queue) {
    try {
      // Check for conflict: has this record in server shadow been updated with different status/version?
      const serverMatch = serverRecords.find((s) => s.id === item.attendanceId);
      if (
        serverMatch &&
        serverMatch.serverVersion &&
        serverMatch.serverVersion > (item.data.serverVersion || 1) &&
        serverMatch.status !== item.data.status
      ) {
        // Conflict detected!
        conflicts.push({
          attendanceId: item.attendanceId,
          studentName: item.data.studentName,
          date: item.data.date,
          subjectName: item.data.subjectName,
          localRecord: item.data,
          serverRecord: serverMatch,
        });

        // Mark local as conflict
        const locIdx = allRecords.findIndex((r) => r.id === item.attendanceId);
        if (locIdx >= 0) {
          allRecords[locIdx].syncStatus = 'conflict';
        }
        remainingQueue.push({ ...item, status: 'conflict' });
        continue;
      }

      // No conflict: apply to server
      const serverIdx = serverRecords.findIndex((s) => s.id === item.attendanceId);
      const syncedRecord: AttendanceRecord = {
        ...item.data,
        syncStatus: 'synced',
        serverVersion: ((serverMatch?.serverVersion || 1) + 1),
      };

      if (serverIdx >= 0) {
        serverRecords[serverIdx] = syncedRecord;
      } else {
        serverRecords.push(syncedRecord);
      }

      // Update local record to synced
      const locIdx = allRecords.findIndex((r) => r.id === item.attendanceId);
      if (locIdx >= 0) {
        allRecords[locIdx] = syncedRecord;
      }

      // Send parent notification if newly synced absence
      if (syncedRecord.status !== 'Hadir') {
        const student = getStudents().find((s) => s.id === syncedRecord.studentId);
        if (student) {
          notifications.unshift({
            id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            studentId: student.id,
            studentName: student.name,
            className: syncedRecord.className,
            parentName: student.parentName,
            parentPhone: student.parentPhone,
            date: syncedRecord.date,
            subjectName: syncedRecord.subjectName,
            status: syncedRecord.status,
            notes: syncedRecord.notes,
            channel: 'WhatsApp',
            sentAt: new Date().toISOString(),
            deliveryStatus: 'Terkirim',
            messageText: `[SMA N 1 Nusantara] (Sinkronisasi Otomatis) Yth. Bpk/Ibu ${student.parentName}, ananda ${student.name} tercatat ${syncedRecord.status} pada ${syncedRecord.subjectName} (${syncedRecord.date}).`,
          });
        }
      }

      syncedCount++;
    } catch (e) {
      errors++;
      item.attempts += 1;
      item.status = 'failed';
      item.errorMessage = 'Gagal mengirim data ke server';
      remainingQueue.push(item);
    }
  }

  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(allRecords));
  localStorage.setItem(STORAGE_KEYS.SERVER_ATTENDANCE, JSON.stringify(serverRecords));
  localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(remainingQueue));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));

  addAuditLog(
    'system-sync',
    'Sistem Sinkronisasi',
    'admin',
    'Sinkronisasi Offline Selesai',
    `Berhasil menyinkronkan ${syncedCount} rekaman. Konflik: ${conflicts.length}, Gagal: ${errors}.`
  );

  notifyListeners();
  return { syncedCount, conflicts, errors };
}

// Conflict Resolution (FR-PWA-08)
export function resolveConflict(attendanceId: string, choice: 'keep_local' | 'keep_server') {
  const allRecords = getAttendanceRecords();
  const serverRecords = getServerAttendanceRecords();
  const queue = getSyncQueue();

  const localIdx = allRecords.findIndex((r) => r.id === attendanceId);
  const serverIdx = serverRecords.findIndex((r) => r.id === attendanceId);

  if (choice === 'keep_local' && localIdx >= 0) {
    allRecords[localIdx].syncStatus = 'synced';
    allRecords[localIdx].serverVersion = (serverRecords[serverIdx]?.serverVersion || 1) + 1;
    if (serverIdx >= 0) {
      serverRecords[serverIdx] = allRecords[localIdx];
    }
  } else if (choice === 'keep_server' && serverIdx >= 0) {
    if (localIdx >= 0) {
      allRecords[localIdx] = { ...serverRecords[serverIdx], syncStatus: 'synced' };
    }
  }

  // Remove from queue
  const newQueue = queue.filter((q) => q.attendanceId !== attendanceId);
  localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(newQueue));
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(allRecords));
  localStorage.setItem(STORAGE_KEYS.SERVER_ATTENDANCE, JSON.stringify(serverRecords));

  addAuditLog(
    'user-resolution',
    'Pengguna',
    'admin',
    'Penyelesaian Konflik Sinkronisasi',
    `Konflik pada absensi ID ${attendanceId} diselesaikan dengan memilih: ${choice === 'keep_local' ? 'Data Perangkat (Lokal)' : 'Data Server'}`
  );

  notifyListeners();
}

// Create an artificial conflict for testing demonstration
export function triggerSimulatedConflict() {
  const allRecords = getAttendanceRecords();
  const serverRecords = getServerAttendanceRecords();
  if (allRecords.length === 0) return;

  const target = allRecords[0];
  // Change local status
  target.status = target.status === 'Hadir' ? 'Izin' : 'Hadir';
  target.syncStatus = 'pending';
  target.localVersion = (target.localVersion || 1) + 2;

  // Make server version higher with different status
  const serverIdx = serverRecords.findIndex((s) => s.id === target.id);
  if (serverIdx >= 0) {
    serverRecords[serverIdx].status = 'Alpa';
    serverRecords[serverIdx].serverVersion = (target.serverVersion || 1) + 5;
  }

  const queue = getSyncQueue();
  queue.push({
    id: 'q-conflict-' + Date.now(),
    attendanceId: target.id,
    data: target,
    action: 'update',
    timestamp: new Date().toISOString(),
    attempts: 0,
    status: 'pending',
  });

  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(allRecords));
  localStorage.setItem(STORAGE_KEYS.SERVER_ATTENDANCE, JSON.stringify(serverRecords));
  localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));

  notifyListeners();
}

// Admin Management Functions (FR-03, FR-04, FR-06)
export function addStudent(student: Omit<Student, 'id'>) {
  const students = getStudents();
  const newStudent: Student = {
    ...student,
    id: 's-' + Date.now(),
  };
  students.push(newStudent);
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  notifyListeners();
  return newStudent;
}

export function updateStudent(id: string, updated: Partial<Student>) {
  const students = getStudents();
  const idx = students.findIndex((s) => s.id === id);
  if (idx >= 0) {
    students[idx] = { ...students[idx], ...updated };
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    notifyListeners();
  }
}

export function deleteStudent(id: string) {
  const students = getStudents().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  notifyListeners();
}

export function addTeacher(teacher: Omit<Teacher, 'id'>) {
  const teachers = getTeachers();
  const newTeacher: Teacher = {
    ...teacher,
    id: 't-' + Date.now(),
  };
  teachers.push(newTeacher);
  localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  notifyListeners();
  return newTeacher;
}

export function addClass(cls: Omit<SchoolClass, 'id'>) {
  const classes = getClasses();
  const newCls: SchoolClass = {
    ...cls,
    id: 'c-' + Date.now(),
  };
  classes.push(newCls);
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  notifyListeners();
  return newCls;
}

export function addSchedule(sch: Omit<ScheduleSession, 'id'>) {
  const schedules = getSchedules();
  const newSch: ScheduleSession = {
    ...sch,
    id: 'sch-' + Date.now(),
  };
  schedules.push(newSch);
  localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
  notifyListeners();
  return newSch;
}

// Reset / Seed default
export function resetToSeedData() {
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
  localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(INITIAL_TEACHERS));
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
  localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(INITIAL_SCHEDULES));
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
  localStorage.setItem(STORAGE_KEYS.SERVER_ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
  localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  localStorage.setItem(STORAGE_KEYS.LAST_PRELOAD_TIME, new Date().toISOString());
  notifyListeners();
}
