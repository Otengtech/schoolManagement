import { useState } from "react";
import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";

import StudentAdmission from "./pages/StudentPage/AdmissionForm";
import MainDashboard from "./pages/MainDashboard";
import Teachers from "./pages/Teachers";
import Classes from "./pages/Parents";

const MainPage = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const renderPage = () => {
    switch (activePage) {
      case "admission-form":
        return <StudentAdmission />;
      case "dashboard":
        return <MainDashboard />;
      case "teachers":
        return <Teachers />;
      case "classes":
        return <Classes />;
      default:
        return <MainDashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        setActivePage={setActivePage}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 bg-gray-100">
        <TopNavbar
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />

        <div className="">
          {renderPage()}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
