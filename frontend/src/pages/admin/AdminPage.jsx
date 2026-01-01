import { useState } from "react";
import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";

import Students from "./pages/StudentPage/Students";
import StudentsAdmission from "./pages/StudentPage/AdmissionForm";
import Teachers from "./pages/TeacherPage/Teachers";
import TeacherForm from "./pages/TeacherPage/TeacherForm";

import MainDashboard from "./pages/MainDashboard";
import Classes from "./pages/ParentPage/Parents";
import ParentAdmission from "./pages/ParentPage/ParentAdmission";
import Parents from "./pages/ParentPage/Parents";
import AnnouncementForm from "./pages/AnnouncementsPage/Form";
import ViewAnnouncements from "./pages/AnnouncementsPage/ViewAnnouncements";

const MainPage = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <MainDashboard />;
      case "admission-form":
        return <StudentsAdmission />;
      case "view-students":
        return <Students />;
      case "teacher-form":
        return <TeacherForm />;
      case "teachers":
        return <Teachers />;
      case "parent-form":
        return <ParentAdmission />;
      case "parents":
        return <Parents />
      case "announce-form":
        return <AnnouncementForm />;
      case "announcements":
        return <ViewAnnouncements />;
      case "classes":
        return <Classes />;
      default:
        return <MainDashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar setActivePage={setActivePage} isSidebarOpen={isSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 bg-gray-100">
        <TopNavbar
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />

        <div className="h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide">
          {/* Padding wrapper */}
          <div className="pb-6">{renderPage()}</div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
