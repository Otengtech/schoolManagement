import { useState, useEffect, useRef } from "react";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBullhorn,
  FaCalendarAlt,
  FaLayerGroup,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronRight,
  FaUserFriends,
  FaBookOpen,
  FaClipboardList,
  FaEnvelope,
  FaUserCog,
  FaLifeRing,
  FaTachometerAlt,
} from "react-icons/fa";

const Sidebar = ({ setActivePage }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
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

  /* ------------------ NAV ITEMS (STUDENT) ------------------ */
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <FaTachometerAlt />,
      action: () => setActivePage("dashboard"),
    },
    {
      id: "personal-info",
      label: "Personal Information",
      icon: <FaUserGraduate />,
      action: () => setActivePage("personal-info"),
    },
    {
      id: "courses",
      label: "My Courses",
      icon: <FaBookOpen />,
      action: () => setActivePage("courses"),
    },
    {
      id: "assignments",
      label: "Assignments",
      icon: <FaUserFriends />,
      action: () => setActivePage("assignments"),
    },
    {
      id: "exams",
      label: "Exams",
      icon: <FaClipboardList />,
      action: () => setActivePage("exams"),
    },
    {
      id: "results",
      label: "Results",
      icon: <FaChalkboardTeacher />,
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
      id: "transactions",
      label: "Fees & Payments",
      icon: <FaLayerGroup />,
      action: () => setActivePage("transactions"),
    },
    {
      id: "settings",
      label: "Profile Settings",
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

  /* ------------------ HANDLERS ------------------ */
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
            <h2 className="text-xl yellow font-bold">Student Panel</h2>
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
            <li
              key={item.id}
              ref={(el) => (navRefs.current[item.id] = el)}
            >
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

export default Sidebar;
