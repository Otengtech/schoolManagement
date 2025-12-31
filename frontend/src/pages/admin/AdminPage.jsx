import { useState } from "react";
import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";

import Students from "./pages/Students";
import MainDashboard from "./pages/MainDashboard";
import Teachers from "./pages/Teachers";
import Classes from "./pages/Parents";

const MainPage = () => {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "students":
        return <Students />;
      case "teachers":
        return <Teachers />;
      case "classes":
        return <Classes />;
      default:
        return <h2 className="text-2xl font-bold">Welcome Admin 👋</h2>;
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar setActivePage={setActivePage} />

      {/* Main Content */}
      <div className="flex-1 min-h-screen bg-gray-100">
        <TopNavbar />

        <div className="p-6">
          {renderPage()}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
