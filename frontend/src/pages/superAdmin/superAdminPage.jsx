import { useState } from "react";
import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";

import CreateAdmin from "./pages/CreateAdmin";

import MainDashboard from "./pages/MainDashboard";

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
      case "admin-form":
        return <CreateAdmin />;
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
