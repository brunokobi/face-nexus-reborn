import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { HomePage } from "@/components/pages/HomePage";
import { ScannerPage } from "@/components/pages/ScannerPage";
import { StudentsPage } from "@/components/pages/StudentsPage";
import { ReportsPage } from "@/components/pages/ReportsPage";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("home");

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onNavigate={setCurrentPage} />;
      case "scanner":
        return <ScannerPage />;
      case "students":
        return <StudentsPage />;
      case "reports":
        return <ReportsPage />;
      case "settings":
        return <div className="p-8 text-center">Configurações em desenvolvimento...</div>;
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
