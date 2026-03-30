import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { HomePage } from "@/components/pages/HomePage";
import { ScannerPage } from "@/components/pages/ScannerPage";
import { StudentsPage } from "@/components/pages/StudentsPage";
import { ReportsPage } from "@/components/pages/ReportsPage";
import { SettingsUsersPage } from "@/components/pages/SettingsUsersPage";
import { useStudentStore } from "@/hooks/use-student-store";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const { students, attendance, addStudent, updateStudent, removeStudent, addAttendanceRecord } = useStudentStore();

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onNavigate={setCurrentPage} />;
      case "scanner":
        return (
          <ScannerPage
            students={students}
            attendance={attendance}
            addAttendanceRecord={addAttendanceRecord}
            updateStudent={updateStudent}
          />
        );
      case "students":
        return (
          <StudentsPage
            students={students}
            addStudent={addStudent}
            updateStudent={updateStudent}
            removeStudent={removeStudent}
          />
        );
      case "reports":
        return <ReportsPage students={students} attendance={attendance} />;
      case "settings":
        return <SettingsUsersPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      {renderPage()}
    </div>
  );
};

export default Index;
