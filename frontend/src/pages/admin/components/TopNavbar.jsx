import { useState, useRef, useEffect } from "react";
import {
  FaUserCircle,
  FaEnvelope,
  FaBell,
  FaTasks,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

const TopNavbar = ({ toggleSidebar, isSidebarOpen }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const profileRef = useRef();
  const messageRef = useRef();
  const notificationRef = useRef();

  // Screen size check
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setShowProfile(false);
      if (messageRef.current && !messageRef.current.contains(e.target))
        setShowMessages(false);
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      )
        setShowNotifications(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const messages = [
    {
      id: 1,
      text: "New student registration request",
      time: "10 min ago",
      read: false,
    },
    { id: 2, text: "Parent meeting scheduled", time: "1 hour ago", read: true },
    { id: 3, text: "Monthly report ready", time: "2 hours ago", read: false },
    {
      id: 4,
      text: "System update notification",
      time: "Yesterday",
      read: true,
    },
  ];

  const notifications = [
    {
      id: 1,
      text: "New student registered",
      time: "Just now",
      type: "user",
      read: false,
    },
    {
      id: 2,
      text: "Payment of $500 received",
      time: "30 min ago",
      type: "payment",
      read: false,
    },
    {
      id: 3,
      text: "New assignment submitted",
      time: "2 hours ago",
      type: "assignment",
      read: true,
    },
    {
      id: 4,
      text: "Server maintenance scheduled",
      time: "1 day ago",
      type: "system",
      read: true,
    },
    {
      id: 5,
      text: "Attendance report generated",
      time: "2 days ago",
      type: "report",
      read: true,
    },
  ];

  const unreadMessages = messages.filter((m) => !m.read).length;
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const getTypeColor = (type) => {
    switch (type) {
      case "user":
        return "bg-green-100 text-green-800";
      case "payment":
        return "bg-blue-100 text-blue-800";
      case "assignment":
        return "bg-purple-100 text-purple-800";
      case "system":
        return "bg-yellow-100 text-yellow-800";
      case "report":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="h-16 pl-16 md:pl-4 bg-[#ffa301] shadow flex items-center justify-between px-4 md:px-6 relative z-30">
      {/* Left */}
      <div>
        <h1 className="text-lg font-bold text-gray-800">TriNova System</h1>
        <p className="text-xs text-gray-500 hidden md:block">
          School Management System
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Messages */}
        <div className="relative" ref={messageRef}>
          <button
            onClick={() => setShowMessages(!showMessages)}
            className="relative p-2 rounded-lg hover:bg-gray-100"
          >
            <FaEnvelope className="text-xl text-[#052954]" />
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {unreadMessages}
              </span>
            )}
          </button>

          {showMessages && (
            <div
              className="
    absolute 
    right-0 
    md:right-0 
    left-1/2 
    md:left-auto 
    -translate-x-1/2 
    md:translate-x-0
    mt-3
    w-[90vw] 
    sm:w-80 
    max-w-sm
    bgc 
    shadow-xl 
    rounded-lg 
    border 
    z-50
  "
            >
              {/* Header */}
              <div className="p-3 border-b font-semibold yellow">
                Messages
              </div>

              {/* Messages List */}
              <div className="max-h-80 overflow-y-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`px-4 py-3 border-b cursor-pointer transition`}
                  >
                    <p className="text-sm yellow">{msg.text}</p>
                    <span className="text-xs text-white">{msg.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-gray-100"
          >
            <FaBell className="text-xl text-[#052954]" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="
    absolute 
    right-0 
    md:right-0 
    left-1/2 
    md:left-auto 
    -translate-x-1/2 
    md:translate-x-0
    mt-3
    w-[90vw] 
    sm:w-80 
    max-w-sm
    bgc
    shadow-xl 
    rounded-lg 
    border 
    z-50
  "
            >
              <div className="p-3 border-b font-semibold yellow">Notifications</div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <div key={notif.id} className="px-4 py-3 border-b">
                    <span
                      className={`text-xs px-2 py-1 rounded ${getTypeColor(
                        notif.type
                      )}`}
                    >
                      {notif.type}
                    </span>
                    <p className="text-sm yellow mt-1">{notif.text}</p>
                    <span className="text-xs text-white">{notif.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaUserCircle className="text-3xl text-[#052954]" />
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-800">John Doe</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 bgc shadow-xl rounded-lg border z-50">
              <div className="p-4 border-b">
                <p className="font-semibold yellow">John Doe</p>
                <p className="text-xs text-white">john.doe@school.edu</p>
              </div>
              <button className="w-full px-4 py-3 yellow hover:bg-gray-700 flex gap-2 items-center">
                <FaTasks /> <span className="text-white">My Tasks</span>
              </button>
              <button className="w-full px-4 py-3 yellow hover:bg-gray-700 flex gap-2 items-center">
                <FaCog /> <span className="text-white">Settings</span>
              </button>
              <button className="w-full px-4 py-3 hover:bg-gray-700 flex gap-2 items-center text-red-600">
                <FaSignOutAlt /> <span className="">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;
