import { useState, useEffect, useRef } from "react";
import {
  FaChalkboardTeacher,
  FaBullhorn,
  FaCalendarAlt,
  FaLayerGroup,
  FaBars,
  FaTimes,
  FaUserFriends,
  FaChevronRight,
  FaBookOpen,
  FaClipboardList,
  FaEnvelope,
  FaUserCog,
  FaLifeRing,
  FaTachometerAlt,
  FaFileAlt,
  FaUserGraduate,
} from "react-icons/fa";

const TeacherSidebar = ({ setActivePage }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const navRefs = useRef({});

  /* ------------------ SCREEN CHECK ------------------ */
  useEffect(() => {
    const checkScreen = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  /* ------------------ NAV ITEMS (TEACHER) ------------------ */
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <FaTachometerAlt />,
      action: () => setActivePage("dashboard"),
    },
    {
      id: "profile",
      label: "My Profile",
      icon: <FaChalkboardTeacher />,
      action: () => setActivePage("profile"),
    },
    {
      id: "courses",
      label: "My Courses",
      icon: <FaBookOpen />,
      action: () => setActivePage("courses"),
    },
    {
      id: "students",
      label: "Students",
      icon: <FaUserGraduate />,
      action: () => setActivePage("students"),
    },
    {
      id: "assignments",
      label: "Assignments",
      icon: <FaClipboardList />,
      action: () => setActivePage("assignments"),
    },
    {
      id: "results",
      label: "Publish Results",
      icon: <FaFileAlt />,
      action: () => setActivePage("results"),
    },
    {
      id: "attendance",
      label: "Attendance",
      icon: <FaCalendarAlt />,
      action: () => setActivePage("attendance"),
    },
    {
      id: "announcements",
      label: "Announcements",
      icon: <FaBullhorn />,
      action: () => setActivePage("announcements"),
    },
    {
      id: "messages",
      label: "Messages",
      icon: <FaEnvelope />,
      action: () => setActivePage("messages"),
    },
    {
      id: "payments",
      label: "Payments",
      icon: <FaLayerGroup />,
      action: () => setActivePage("payments"),
    },
    {
      id: "settings",
      label: "Settings",
      icon: <FaUserCog />,
      action: () => setActivePage("settings"),
    },
    {
      id: "support",
      label: "Help & Support",
      icon: <FaLifeRing />,
      action: () => setActivePage("support"),
    },
  ];

  /* ------------------ HANDLER ------------------ */
  const handleClick = (item) => {
    item.action();
    setCurrentPage(item.id);
    if (isMobile) setIsOpen(false);
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* MOBILE MENU BUTTON */}
      {isMobile && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-3 left-4 z-50"
        >
          <FaBars />
        </button>
      )}

      {/* SIDEBAR */}
      <div
        className={`${
          isMobile
            ? `fixed top-0 left-0 h-screen w-64 z-50 transform ${
                isOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : `${isOpen ? "w-64" : "w-16"} h-screen`
        } bgc text-white transition-all duration-300 flex flex-col`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {isOpen && (
            <h2 className="text-xl yellow font-bold">Teacher Panel</h2>
          )}
          {!isMobile && (
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <FaChevronRight /> : <FaBars />}
            </button>
          )}
          {isMobile && isOpen && (
            <button onClick={() => setIsOpen(false)}>
              <FaTimes />
            </button>
          )}
        </div>

        {/* MENU */}
        <ul className="mt-4 space-y-1 flex-grow overflow-y-auto">
          {navItems.map((item) => (
            <li key={item.id} ref={(el) => (navRefs.current[item.id] = el)}>
              <div
                onClick={() => handleClick(item)}
                className={`flex items-center ${
                  isOpen ? "gap-4 px-4" : "justify-center"
                } py-3 cursor-pointer hover:bg-gray-800 transition ${
                  currentPage === item.id ? "bg-gray-700" : ""
                }`}
              >
                <span className="text-xl yellow">{item.icon}</span>
                {isOpen && <span>{item.label}</span>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default TeacherSidebar;
