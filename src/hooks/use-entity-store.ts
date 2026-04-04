import { useState, useCallback } from "react";
import type { Teacher, Discipline } from "@/types/student";

const TEACHERS_KEY = "presence-now-teachers";
const DISCIPLINES_KEY = "presence-now-disciplines";

function loadTeachers(): Teacher[] {
  try {
    const raw = localStorage.getItem(TEACHERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    return parsed.map((r) => ({
      ...(r as Omit<Teacher, "registrationDate">),
      registrationDate: new Date(r.registrationDate as string),
    }));
  } catch {
    return [];
  }
}

function saveTeachers(teachers: Teacher[]) {
  localStorage.setItem(TEACHERS_KEY, JSON.stringify(teachers));
}

function loadDisciplines(): Discipline[] {
  try {
    const raw = localStorage.getItem(DISCIPLINES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    return parsed.map((r) => ({
      ...(r as Omit<Discipline, "registrationDate">),
      registrationDate: new Date(r.registrationDate as string),
    }));
  } catch {
    return [];
  }
}

function saveDisciplines(disciplines: Discipline[]) {
  localStorage.setItem(DISCIPLINES_KEY, JSON.stringify(disciplines));
}

export function useEntityStore() {
  const [teachers, setTeachers] = useState<Teacher[]>(loadTeachers);
  const [disciplines, setDisciplines] = useState<Discipline[]>(loadDisciplines);

  const addTeacher = useCallback((teacher: Teacher) => {
    setTeachers((prev) => {
      const next = [...prev, teacher];
      saveTeachers(next);
      return next;
    });
  }, []);

  const updateTeacher = useCallback((id: string, data: Partial<Teacher>) => {
    setTeachers((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...data } : t));
      saveTeachers(next);
      return next;
    });
  }, []);

  const removeTeacher = useCallback((id: string) => {
    setTeachers((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveTeachers(next);
      return next;
    });
  }, []);

  const addDiscipline = useCallback((discipline: Discipline) => {
    setDisciplines((prev) => {
      const next = [...prev, discipline];
      saveDisciplines(next);
      return next;
    });
  }, []);

  const updateDiscipline = useCallback((id: string, data: Partial<Discipline>) => {
    setDisciplines((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, ...data } : d));
      saveDisciplines(next);
      return next;
    });
  }, []);

  const removeDiscipline = useCallback((id: string) => {
    setDisciplines((prev) => {
      const next = prev.filter((d) => d.id !== id);
      saveDisciplines(next);
      return next;
    });
  }, []);

  return {
    teachers,
    disciplines,
    addTeacher,
    updateTeacher,
    removeTeacher,
    addDiscipline,
    updateDiscipline,
    removeDiscipline,
  };
}
