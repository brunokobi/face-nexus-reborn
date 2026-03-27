import { useReducer, useCallback } from "react";
import type { Student, AttendanceRecord } from "@/types/student";

const STORAGE_KEY = "presence-now-students";
const ATTENDANCE_KEY = "presence-now-attendance";

function loadStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown[];
    return parsed.map((s) => {
      const rec = s as Record<string, unknown>;
      return {
        ...(rec as Omit<Student, "registrationDate" | "faceDescriptor">),
        registrationDate: new Date(rec.registrationDate as string),
        faceDescriptor: rec.faceDescriptor
          ? new Float32Array(rec.faceDescriptor as number[])
          : undefined,
      } as Student;
    });
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
    const parsed = JSON.parse(raw) as unknown[];
    return parsed.map((r) => {
      const rec = r as Record<string, unknown>;
      return {
        ...(rec as Omit<AttendanceRecord, "timestamp">),
        timestamp: new Date(rec.timestamp as string),
      } as AttendanceRecord;
    });
  } catch {
    return [];
  }
}

function saveAttendance(records: AttendanceRecord[]) {
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
}

interface StoreState {
  students: Student[];
  attendance: AttendanceRecord[];
}

type StoreAction =
  | { type: "ADD_STUDENT"; student: Student }
  | { type: "UPDATE_STUDENT"; id: string; data: Partial<Student> }
  | { type: "REMOVE_STUDENT"; id: string }
  | { type: "ADD_ATTENDANCE"; record: AttendanceRecord };

function reducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case "ADD_STUDENT": {
      const next = [...state.students, action.student];
      saveStudents(next);
      return { ...state, students: next };
    }
    case "UPDATE_STUDENT": {
      const next = state.students.map((s) =>
        s.id === action.id ? { ...s, ...action.data } : s
      );
      saveStudents(next);
      return { ...state, students: next };
    }
    case "REMOVE_STUDENT": {
      const next = state.students.filter((s) => s.id !== action.id);
      saveStudents(next);
      return { ...state, students: next };
    }
    case "ADD_ATTENDANCE": {
      const nextAttendance = [action.record, ...state.attendance];
      const nextStudents = state.students.map((s) =>
        s.id === action.record.studentId
          ? { ...s, presenceCount: s.presenceCount + 1 }
          : s
      );
      saveAttendance(nextAttendance);
      saveStudents(nextStudents);
      return { students: nextStudents, attendance: nextAttendance };
    }
  }
}

const initialState: StoreState = {
  students: loadStudents(),
  attendance: loadAttendance(),
};

export function useStudentStore() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addStudent = useCallback((student: Student) => {
    dispatch({ type: "ADD_STUDENT", student });
  }, []);

  const updateStudent = useCallback((id: string, data: Partial<Student>) => {
    dispatch({ type: "UPDATE_STUDENT", id, data });
  }, []);

  const removeStudent = useCallback((id: string) => {
    dispatch({ type: "REMOVE_STUDENT", id });
  }, []);

  const addAttendanceRecord = useCallback((record: AttendanceRecord) => {
    dispatch({ type: "ADD_ATTENDANCE", record });
  }, []);

  return {
    students: state.students,
    attendance: state.attendance,
    addStudent,
    updateStudent,
    removeStudent,
    addAttendanceRecord,
  };
}
