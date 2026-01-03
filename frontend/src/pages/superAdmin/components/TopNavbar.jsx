import { useState, useRef, useEffect } from "react";
import {
  FaUserCircle,
  FaEnvelope,
  FaBell,
  FaExclamationCircle,
  FaTasks,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

const TopNavbar = ({ toggleSidebar, isSidebarOpen }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  return (
    <div className="h-16 pl-16 md:pl-4 bg-[#ffa301] shadow flex items-center justify-between px-4 md:px-6 relative z-30">
      {/* Left */}
      <div>
        <h1 className="text-lg font-bold text-gray-800">TriNova System</h1>
        <p className="text-xs text-gray-500 hidden md:block">
          SuperAdmin Page
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Messages */}
      </div>
    </div>
  );
};

export default TopNavbar;
