import { useState, useEffect, useRef } from "react";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUserCog,
  FaBullhorn,
  FaChartBar,
  FaCalendarAlt,
  FaMoneyBill,
  FaEnvelope,
  FaFileAlt,
  FaList,
  FaEdit,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronRight,
  FaUserFriends,
  FaUserPlus,
  FaSearch,
  FaLayerGroup,
  FaUserShield,
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
      if (mobile) {
        setIsOpen(false); // Closed on mobile by default
      } else {
        setIsOpen(true); // Always open on desktop
      }
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  /* ------------------ NAV ITEMS ------------------ */
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <FaTachometerAlt />,
      action: () => setActivePage("dashboard"),
    },
    {
      id: "students",
      label: "Students",
      icon: <FaUserGraduate />,
      hasDropdown: true,
      submenu: [
        { label: "Admission Form", icon: <FaFileAlt />, action: () => setActivePage("admission-form") },
        { label: "View Students", icon: <FaList />, action: () => setActivePage("view-students") },
      ],
    },
    {
      id: "teachers",
      label: "Teachers",
      icon: <FaChalkboardTeacher />,
      hasDropdown: true,
      submenu: [
        { label: "Teacher Form", icon: <FaUserPlus />, action: () => setActivePage("teacher-form") },
        { label: "View Teachers", icon: <FaList />, action: () => setActivePage("teachers") },
      ],
    },
    {
      id: "parents",
      label: "Parents",
      icon: <FaUserFriends />,
      hasDropdown: true,
      submenu: [
        { label: "Parent Form", icon: <FaUserPlus />, action: () => setActivePage("parent-form") },
        { label: "View Parents", icon: <FaList />, action: () => setActivePage("parents") },
      ],
    },
    {
      id: "announcements",
      label: "Announcements",
      icon: <FaBullhorn />,
      hasDropdown: true,
      submenu: [
        { label: "Announce Form", icon: <FaUserPlus />, action: () => setActivePage("announce-form") },
        { label: "View Announcements", icon: <FaList />, action: () => setActivePage("announcements") },
      ],
    },
    { id: "classes", label: "Classes", icon: <FaLayerGroup />, action: () => setActivePage("classes") },
    { id: "attendance", label: "Attendance", icon: <FaCalendarAlt />, action: () => setActivePage("attendance") },
    { id: "finance", label: "Finance", icon: <FaMoneyBill />, action: () => setActivePage("finance") },
    { id: "reports", label: "Reports", icon: <FaChartBar />, action: () => setActivePage("reports") },
    { id: "communication", label: "Communication", icon: <FaEnvelope />, action: () => setActivePage("communication") },
    { id: "settings", label: "Setting", icon: <FaUserCog />, action: () => setActivePage("settings") },
  ];

  /* ------------------ HANDLERS ------------------ */
  const handleClick = (item) => {
    if (item.hasDropdown) {
      setOpenDropdown(openDropdown === item.id ? null : item.id);
    } else {
      item.action();
      setCurrentPage(item.id);
      if (isMobile) setIsOpen(false);
    }
  };

  /* ------------------ FLOATING MENU REMOVED ------------------ */
  // Removed floating menu functionality since sidebar is always open on desktop

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* HAMBURGER MENU FOR MOBILE ONLY */}
      {isMobile && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-2 left-4 text-gray-800 p-3 rounded-lg z-50 transition-colors duration-200 bg-white shadow-md"
        >
          <FaBars className="text-lg" />
        </button>
      )}

      {/* SIDEBAR - Always open on desktop, toggleable on mobile */}
      <div
        className={`${
          isMobile
            ? `fixed top-0 left-0 h-screen w-64 z-50 transform transition-transform duration-300 ease-in-out ${
                isOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : `relative h-screen w-64 flex-shrink-0` // Always 64 width on desktop
        } bgc text-white flex flex-col`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl yellow font-bold whitespace-nowrap">Admin Panel</h2>
          {isMobile && isOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* MENU */}
        <ul className="mt-4 space-y-1 flex-grow overflow-y-auto">
          {navItems.map((item) => (
            <li key={item.id} className="relative">
              <div
                onClick={() => handleClick(item)}
                className={`flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-gray-800 transition-colors duration-200 ${
                  currentPage === item.id ? "bg-gray-700" : ""
                }`}
              >
                <span className="text-xl yellow">{item.icon}</span>
                <span className="flex-grow">{item.label}</span>
                {item.hasDropdown && (
                  <span className="transition-transform yellow duration-200">
                    {openDropdown === item.id ? <FaChevronDown /> : <FaChevronRight />}
                  </span>
                )}
              </div>

              {/* DROPDOWN */}
              {item.hasDropdown && openDropdown === item.id && (
                <div className="ml-4 mr-2 space-y-1 border-l border-gray-700">
                  {item.submenu.map((sub, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        sub.action();
                        setCurrentPage(sub.label.toLowerCase().replace(/\s+/g, "-"));
                        if (isMobile) setIsOpen(false);
                      }}
                      className={`flex items-center gap-3 py-2 px-4 hover:bg-gray-800 cursor-pointer transition-colors duration-200 ${
                        currentPage === sub.label.toLowerCase().replace(/\s+/g, "-") ? "bg-gray-700" : ""
                      }`}
                    >
                      <span className="yellow">{sub.icon}</span>
                      <span className="text-sm">{sub.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;