import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUsers,
  FaSchool,
  FaBook,
  FaCalendarCheck,
  FaFileAlt,
  FaMoneyBillWave,
  FaClock,
  FaEnvelope,
  FaChartBar,
  FaCog,
  FaQuestionCircle,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

/* IMPORT ADMIN PAGES */
import AddUsers from "./adminPages/AddUsers";
import Students from "./adminPages/Students";
import Teachers from "./adminPages/Teachers";
import Parents from "./adminPages/Parents";
import MainDashboard  from "./adminPages/MainDashboard";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <FaHome /> },
    { id: "users", label: "Add Users", icon: <FaUsers /> },
    { id: "students", label: "Students", icon: <FaUserGraduate /> },
    { id: "teachers", label: "Teachers", icon: <FaChalkboardTeacher /> },
    { id: "parents", label: "Parents", icon: <FaUsers /> },
    { id: "classes", label: "Classes", icon: <FaSchool /> },
    { id: "subjects", label: "Subjects", icon: <FaBook /> },
    { id: "attendance", label: "Attendance", icon: <FaCalendarCheck /> },
    { id: "exams", label: "Exams & Results", icon: <FaFileAlt /> },
    { id: "fees", label: "Fees & Payments", icon: <FaMoneyBillWave /> },
    { id: "timetable", label: "Timetable", icon: <FaClock /> },
    { id: "messages", label: "Messages", icon: <FaEnvelope /> },
    { id: "reports", label: "Reports", icon: <FaChartBar /> },
    { id: "settings", label: "Settings", icon: <FaCog /> },
    { id: "support", label: "Help & Support", icon: <FaQuestionCircle /> },
  ];

  /* RENDER PAGE BASED ON ACTIVE TAB */
  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return <AddUsers />;
      case "students":
        return <Students />;
      case "teachers":
        return <Teachers />;
      case "parents":
        return <Parents />;
      default:
        return <MainDashboard />;
    }
  };

  useEffect(() => {
  if (isSidebarOpen && window.innerWidth < 1024) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [isSidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow p-4 flex items-center justify-between">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-gray-600"
        >
          {isSidebarOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>
        <h1 className="text-lg font-bold">School Admin</h1>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 pt-16 md:pt-0 left-0 h-full bg-gray-900 shadow-lg z-40
          transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"}
          lg:translate-x-0
        `}
      >
        <div className="px-4 py-4 border-b">
          <h2 className="text-lg text-green-500 font-bold">Management System</h2>
          <p className="text-sm text-white">Admin Dashboard</p>
        </div>

        <nav className="p-4 overflow-y-auto h-[calc(100vh-180px)]">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-4 py-3 transition
                    ${
                      activeTab === item.id
                        ? "bg-gray-800 text-green-500 border-l-4 border-green-500"
                        : "text-white hover:bg-gray-800"
                    }
                  `}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full border-t p-2 bg-gray-900">
          <button className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-gray-800">
            <FaSignOutAlt className="mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div
        className={`pt-16 lg:pt-0 transition-all ${
          isSidebarOpen ? "lg:ml-64" : "lg:ml-0"
        }`}
      >
        <main className="">{renderContent()}</main>
      </div>

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
