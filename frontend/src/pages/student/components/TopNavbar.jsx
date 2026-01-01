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
  const [loading, setLoading] = useState(true);

  const profileRef = useRef();
  const messageRef = useRef();
  const notificationRef = useRef();

  const [announcements, setAnnouncements] = useState([]);
  useEffect(() => {
    fetch("/annouce.json")
      .then((res) => res.json())
      .then((data) => {
        setAnnouncements(data.announce);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

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
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              10
            </span>
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
              <div className="p-3 border-b font-semibold yellow">Messages</div>

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
            {announcements > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {announcements.length}
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
    z-50
  "
            >
              <div className="p-3 border-b font-semibold yellow">
                Notifications
              </div>
              <div className="max-h-80 overflow-y-auto">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="border-t flex flex-col gap-2 p-4"
                  >
                    {/* Image */}
                    <div className="flex items-center justify-center">
                      <div>
                        {ann.image ? (
                          <img
                            src={ann.image}
                            alt={ann.title}
                            className="w-10 h-10 object-cover rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 ml-3">
                          <h3 className="text-lg font-semibold yellow">
                            {ann.title}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        
                        <p className="text-sm text-white">
                          {ann.description}
                        </p>
                      </div>

                      <div className="flex justify-between mt-2 text-xs text-gray-300">
                        <span>By: {ann.author}</span>
                        <span>Date: {ann.date}</span>
                      </div>
                    </div>
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
