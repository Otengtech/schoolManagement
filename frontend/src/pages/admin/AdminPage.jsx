import { useState, useEffect } from "react";
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
import Setting from "./pages/SettingPage/Setting";
import ViewAnnouncements from "./pages/AnnouncementsPage/ViewAnnouncements";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const MainPage = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Verify user is admin
    if (user?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


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
      case "settings":
        return <Setting />;
      default:
        return <MainDashboard />;
    }
  };

 return (
  <div className="flex h-screen overflow-hidden">
    {/* Sidebar */}
    <Sidebar setActivePage={setActivePage} isSidebarOpen={isSidebarOpen} />
    
    {/* Main Content */}
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* TopNavbar is now fixed and outside the scrollable area */}
      <TopNavbar
        setActivePage={setActivePage}
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />
      
      {/* Content starts below the fixed navbar */}
      <div className="flex-1 overflow-y-auto">
        <div className="pt-14">
          {renderPage()}
        </div>
      </div>
    </div>
  </div>
);
};

export default MainPage;
