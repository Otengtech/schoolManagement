import { useState, useEffect, useRef } from "react";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaCog,
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
      if (mobile) setIsOpen(false);
      else setIsOpen(true);
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
      id: "admins",
      label: "Administrators",
      icon: <FaUserGraduate />,
      hasDropdown: true,
      submenu: [
        { label: "Add Admin", icon: <FaUserPlus />, action: () => setActivePage("admin-form") },
        { label: "View Admins", icon: <FaLayerGroup />, action: () => setActivePage("view-admins") },
        { label: "Delete Admin", icon: <FaFileAlt />, action: () => setActivePage("delete-admin") },
        { label: "Update Admin", icon: <FaList />, action: () => setActivePage("update-admin") },
      ],
    },
    {
      id: "profile",
      label: "Profile",
      icon: <FaEdit />,
    },
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

  /* ------------------ FLOATING MENU ------------------ */
  const FloatingMenu = () => {
    if (!hoveredItem || isOpen || isMobile) return null;
    const item = navItems.find((n) => n.id === hoveredItem);
    if (!item || !item.submenu) return null;
    const rect = navRefs.current[hoveredItem]?.getBoundingClientRect();
    if (!rect) return null;

    return (
      <div
        className="fixed bgc text-white z-50 shadow-xl rounded-lg overflow-hidden min-w-[200px] border border-gray-700"
        style={{ top: rect.top, left: rect.right + 8 }}
        onMouseEnter={() => setHoveredItem(item.id)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        {item.submenu.map((sub, i) => (
          <div
            key={i}
            onClick={() => {
              sub.action();
              setCurrentPage(sub.label.toLowerCase().replace(/\s+/g, "-"));
              setHoveredItem(null);
            }}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-200 border-t border-gray-700 ${
              currentPage === sub.label.toLowerCase().replace(/\s+/g, "-") ? "bg-gray-700" : ""
            }`}
          >
            <span className="yellow">{sub.icon}</span>
            <span className="text-sm font-medium">{sub.label}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* COLLAPSED OPEN BUTTON FOR MOBILE */}
      {isMobile && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-3 left-4 text-gray-800 p-3 rounded-lg z-50 transition-colors duration-200"
        >
          <FaBars className="text-lg" />
        </button>
      )}

      {/* SIDEBAR */}
      <div
        className={`${
          isMobile
            ? `fixed top-0 left-0 h-screen w-64 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`
            : `relative h-screen transition-all duration-300 ${isOpen ? "w-64" : "w-16"}`
        } bgc text-white flex flex-col`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {isOpen && <h2 className="text-xl yellow font-bold whitespace-nowrap">Admin Panel</h2>}
          <div className="flex items-center gap-2">
            {!isMobile && (
              <button onClick={() => setIsOpen(!isOpen)} className="transition-colors duration-200">
                {isOpen ? <FaChevronRight /> : <FaBars />}
              </button>
            )}
            {isMobile && isOpen && (
              <button
                onClick={() => setIsOpen(false)}
                className="ml-auto text-gray-400 hover:text-white transition-colors duration-200"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {/* MENU */}
        <ul className="mt-4 space-y-1 flex-grow overflow-y-auto">
          {navItems.map((item) => (
            <li
              key={item.id}
              ref={(el) => (navRefs.current[item.id] = el)}
              className="relative"
              onMouseEnter={() => !isMobile && !isOpen && item.hasDropdown && setHoveredItem(item.id)}
              onMouseLeave={() => !isMobile && !isOpen && setHoveredItem(null)}
            >
              <div
                onClick={() => handleClick(item)}
                className={`flex items-center ${isOpen ? "gap-4 px-4" : "justify-center px-2"} py-3 cursor-pointer hover:bg-gray-800 transition-colors duration-200 relative group ${
                  currentPage === item.id ? "bg-gray-700" : ""
                }`}
              >
                <span className="text-xl yellow">{item.icon}</span>
                {isOpen && (
                  <>
                    <span className="flex-grow">{item.label}</span>
                    {item.hasDropdown && (
                      <span className="transition-transform yellow duration-200">
                        {openDropdown === item.id ? <FaChevronDown /> : <FaChevronRight />}
                      </span>
                    )}
                  </>
                )}

                {/* Tooltip for collapsed state */}
                {!isOpen && !isMobile && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                    {item.label}
                  </div>
                )}
              </div>

              {/* DROPDOWN (EXPANDED SIDEBAR) */}
              {item.hasDropdown && openDropdown === item.id && isOpen && (
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

      {/* FLOATING MENU */}
      <FloatingMenu />
    </>
  );
};

export default Sidebar;
