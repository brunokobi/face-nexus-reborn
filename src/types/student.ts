export interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  registrationDate: Date;
  avatar?: string; // base64 image
  faceDescriptor?: Float32Array;
  presenceCount: number;
  totalClasses: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  timestamp: Date;
  confidence: number;
  location: string;
  status: "success" | "warning" | "error";
}
