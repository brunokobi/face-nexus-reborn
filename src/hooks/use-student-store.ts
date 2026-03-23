import { useState, useCallback } from "react";
import type { Student, AttendanceRecord } from "@/types/student";

// Simple in-memory store with localStorage persistence
const STORAGE_KEY = "presence-now-students";
const ATTENDANCE_KEY = "presence-now-attendance";

function loadStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((s: any) => ({
      ...s,
      registrationDate: new Date(s.registrationDate),
      faceDescriptor: s.faceDescriptor
        ? new Float32Array(s.faceDescriptor)
        : undefined,
    }));
  } catch {
    return [];
  }
}

function saveStudents(students: Student[]) {
  const serialized = students.map((s) => ({
    ...s,
    registrationDate: s.registrationDate.toISOString(),
    faceDescriptor: s.faceDescriptor ? Array.from(s.faceDescriptor) : undefined,
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
}

function loadAttendance(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(ATTENDANCE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((r: any) => ({
      ...r,
      timestamp: new Date(r.timestamp),
    }));
  } catch {
    return [];
  }
}

function saveAttendance(records: AttendanceRecord[]) {
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
}

export function useStudentStore() {
  const [students, setStudents] = useState<Student[]>(loadStudents);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(loadAttendance);

  const addStudent = useCallback((student: Student) => {
    setStudents((prev) => {
      const next = [...prev, student];
      saveStudents(next);
      return next;
    });
  }, []);

  const updateStudent = useCallback((id: string, data: Partial<Student>) => {
    setStudents((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...data } : s));
      saveStudents(next);
      return next;
    });
  }, []);

  const removeStudent = useCallback((id: string) => {
    setStudents((prev) => {
      const next = prev.filter((s) => s.id !== id);
      saveStudents(next);
      return next;
    });
  }, []);

  const addAttendanceRecord = useCallback((record: AttendanceRecord) => {
    setAttendance((prev) => {
      const next = [record, ...prev];
      saveAttendance(next);
      return next;
    });
    // Increment presence count for the student
    setStudents((prev) => {
      const next = prev.map((s) =>
        s.id === record.studentId
          ? { ...s, presenceCount: s.presenceCount + 1 }
          : s
      );
      saveStudents(next);
      return next;
    });
  }, []);

  return {
    students,
    attendance,
    addStudent,
    updateStudent,
    removeStudent,
    addAttendanceRecord,
  };
}
