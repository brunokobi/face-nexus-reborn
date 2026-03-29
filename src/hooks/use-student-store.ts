import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Student, AttendanceRecord } from "@/types/student";

const ATTENDANCE_KEY = "presence-now-attendance";

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

export function useStudentStore() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(loadAttendance());
  const [isLoading, setIsLoading] = useState(true);

  // Load students from Supabase on mount
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || cancelled) {
        setIsLoading(false);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("alunos")
        .select("*");

      if (error) {
        console.error("Erro ao carregar alunos:", error);
        setIsLoading(false);
        return;
      }

      if (data && !cancelled) {
        const mapped: Student[] = data.map((row: Record<string, unknown>) => ({
          id: row.id as string,
          matricula: (row.matricula as string) || "",
          name: (row.nome as string) || "",
          email: (row.email as string) || "",
          course: (row.course as string) || "",
          registrationDate: new Date(row.created_at as string),
          avatar: (row.foto as string) || undefined,
          faceDescriptor: row.face_descriptor
            ? new Float32Array(row.face_descriptor as number[])
            : undefined,
          presenceCount: (row.presence_count as number) || 0,
          totalClasses: (row.total_classes as number) || 0,
        }));
        setStudents(mapped);
      }
      setIsLoading(false);
    };

    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const addStudent = useCallback((student: Student) => {
    setStudents((prev) => [...prev, student]);
  }, []);

  const updateStudent = useCallback((id: string, data: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s))
    );
  }, []);

  const removeStudent = useCallback((id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const addAttendanceRecord = useCallback((record: AttendanceRecord) => {
    setAttendance((prev) => {
      const next = [record, ...prev];
      saveAttendance(next);
      return next;
    });
    setStudents((prev) =>
      prev.map((s) =>
        s.id === record.studentId
          ? { ...s, presenceCount: s.presenceCount + 1 }
          : s
      )
    );
  }, []);

  return {
    students,
    attendance,
    isLoading,
    addStudent,
    updateStudent,
    removeStudent,
    addAttendanceRecord,
  };
}
