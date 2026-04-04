export interface Student {
  id: string;
  matricula?: string;
  name: string;
  email: string;
  course: string;
  registrationDate: Date;
  avatar?: string; // base64 image
  faceDescriptor?: Float32Array;
  presenceCount: number;
  totalClasses: number;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  department: string;
  registrationDate: Date;
}

export interface Discipline {
  id: string;
  code: string;
  name: string;
  course: string;
  teacherId: string;
  workloadHours: number;
  description?: string;
  registrationDate: Date;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  timestamp: Date;
  confidence: number;
  location: string;
  status: "success" | "warning" | "error";
  disciplineId?: string;
  disciplineName?: string;
  teacherId?: string;
  teacherName?: string;
}
