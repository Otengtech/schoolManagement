import { useState, useRef, useEffect } from "react";
import {
  FaEnvelope,
  FaBell,
  FaUser,
  FaTasks,
  FaCog,
  FaSignOutAlt,
  FaUserCircle,
  FaBullhorn,
  FaCalendarAlt,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";

const TopNavbar = ({ setActivePage, toggleSidebar, isSidebarOpen }) => {
  // State
  const [showProfile, setShowProfile] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);

  // Refs
  const profileRef = useRef();
  const messageRef = useRef();
  const notificationRef = useRef();

  // Navigation
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();

  // Messages data
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

  // NEW: Get admin data
  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // 1. First check for complete admin data stored during creation
      const storedCompleteAdmin = localStorage.getItem("currentAdmin");

      if (storedCompleteAdmin) {
        try {
          const completeAdmin = JSON.parse(storedCompleteAdmin);
          const adminInfo = {
            ...(completeAdmin.data || {}),
            ...completeAdmin,
            message: undefined,
          };

          delete adminInfo.message;

          setAdminData(adminInfo);
          return;
        } catch (parseError) {
          console.error("Error parsing currentAdmin:", parseError);
        }
      }

      // 2. Fallback to user data from login
      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!userStr || !token) {
        toast.error("Please login first");
        navigate("/login");
        return;
      }

      const user = JSON.parse(userStr);

      // Get school name from localStorage
      const schoolName =
        localStorage.getItem("createdSchoolName") || "Your School";

      // Create admin info object
      const adminInfo = {
        ...user,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        profileImage: user.profileImage || "",
        schoolId: user.school || "",
        schoolName: schoolName,
        email: user.email || "",
      };

      setAdminData(adminInfo);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load admin data");

      // Ultimate fallback
      setAdminData({
        firstName: "Admin",
        lastName: "User",
        schoolName: "Your School",
        email: "admin@school.edu",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch announcements from backend API
  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.log("No token found, skipping announcements fetch");
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_API_URI || 
        "https://school-management-system-backend-three.vercel.app";

      const response = await fetch(`${API_BASE_URL}/get-announce`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch announcements: ${response.status}`);
      }

      const data = await response.json();
      console.log("Announcements API response:", data);

      // Get watched announcements from localStorage
      const watchedAnnouncements = JSON.parse(localStorage.getItem('watchedAnnouncements') || '{}');

      if (data.data && Array.isArray(data.data)) {
        // Transform and add watched status
        const transformedAnnouncements = data.data.map((announcement) => {
          const announcementId = announcement._id;
          const isWatched = watchedAnnouncements[announcementId] === true;
          
          return {
            id: announcementId,
            title: announcement.title,
            description: announcement.description,
            date: announcement.date,
            author: announcement.author,
            createdAt: announcement.createdAt,
            image: announcement.image,
            deliveryStatus: announcement.deliveryStatus || "sent",
            watched: isWatched,
            // Add default values if missing
            recipients: announcement.recipients || { roles: [], specificUsers: [] },
            channels: announcement.channels || { email: true, sms: false, inApp: true }
          };
        });

        setAnnouncements(transformedAnnouncements);

        // Calculate unread notifications (not watched)
        const unreadCount = transformedAnnouncements.filter(a => !a.watched).length;
        setNotificationCount(unreadCount);
      } else {
        setAnnouncements([]);
        setNotificationCount(0);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setAnnouncements([]);
      setNotificationCount(0);
    }
  };

  // Mark announcement as watched
  const markAsWatched = (announcementId) => {
    try {
      // Get current watched announcements
      const watchedAnnouncements = JSON.parse(
        localStorage.getItem('watchedAnnouncements') || '{}'
      );

      // Mark this announcement as watched
      watchedAnnouncements[announcementId] = true;
      localStorage.setItem('watchedAnnouncements', JSON.stringify(watchedAnnouncements));

      // Update state
      setAnnouncements(prev => 
        prev.map(ann => 
          ann.id === announcementId 
            ? { ...ann, watched: true }
            : ann
        )
      );

      // Update notification count
      setNotificationCount(prev => Math.max(0, prev - 1));
      
      toast.info("Marked as read");
    } catch (error) {
      console.error("Error marking as watched:", error);
    }
  };

  // Mark all as watched
  const markAllAsWatched = () => {
    try {
      // Get current watched announcements
      const watchedAnnouncements = JSON.parse(
        localStorage.getItem('watchedAnnouncements') || '{}'
      );

      // Mark all current announcements as watched
      announcements.forEach(ann => {
        if (!ann.watched) {
          watchedAnnouncements[ann.id] = true;
        }
      });

      localStorage.setItem('watchedAnnouncements', JSON.stringify(watchedAnnouncements));

      // Update state
      setAnnouncements(prev => 
        prev.map(ann => ({ ...ann, watched: true }))
      );

      // Reset notification count
      setNotificationCount(0);
      
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as watched:", error);
    }
  };

  // Initialize
  useEffect(() => {
    fetchAdminData();
    fetchAnnouncements();

    // Screen size check
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);

    // Refresh announcements every 30 seconds
    const interval = setInterval(fetchAnnouncements, 30000);

    return () => {
      window.removeEventListener("resize", checkScreen);
      clearInterval(interval);
    };
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
      if (messageRef.current && !messageRef.current.contains(e.target)) {
        setShowMessages(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout handler
  const handleLogout = () => {
    try {
      // Clear session data only
      const currentEmail = localStorage.getItem("currentActiveEmail");
      if (currentEmail) {
        localStorage.removeItem(`currentAdmin_${currentEmail}`);
        localStorage.removeItem(`token_${currentEmail}`);
      }

      // Clear general session data
      localStorage.removeItem("currentActiveEmail");
      localStorage.removeItem("token");
      localStorage.removeItem("currentAdmin");

      // Use auth context logout
      authLogout();

      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  // Extract admin information
  const adminName = adminData
    ? `${adminData.firstName || ""} ${adminData.lastName || ""}`.trim()
    : "Admin";

  const schoolName = adminData?.schoolName || "Your School";
  const adminEmail = adminData?.email || "Not available";
  const profileImage = adminData?.profileImage;

  // Unread messages count
  const unreadMessages = messages.filter((msg) => !msg.read).length;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Render profile dropdown
  const renderProfileDropdown = () => (
    <div className="absolute right-0 mt-2 w-56 bg-gradient-to-br from-[#052954] to-[#041e42] shadow-xl rounded-lg border border-white/10 z-50">
      {/* Profile Header */}
      <div className="p-4 border-b border-white/10">
        <p className="font-semibold text-white">{adminName}</p>
        <p className="text-xs text-gray-300">{adminEmail}</p>
        <p className="text-xs text-[#ffa301] mt-1">{schoolName}</p>
      </div>

      {/* Dropdown Items */}
      <div className="py-1">
        <button
          onClick={() => {
            setActivePage("dashboard");
            setShowProfile(false);
          }}
          className="w-full px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-white"
        >
          <span className="text-[#ffa301]">🏠</span>
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => {
            setActivePage("settings");
            setShowProfile(false);
          }}
          className="w-full px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-white"
        >
          <FaCog className="text-[#ffa301]" />
          <span>Settings</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 hover:bg-red-500/20 flex items-center gap-3 text-red-400 hover:text-red-300"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  // Render messages dropdown
  const renderMessagesDropdown = () => (
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
      bg-gradient-to-br from-[#052954] to-[#041e42]
      shadow-xl 
      rounded-lg 
      border border-white/10
      z-50
    "
    >
      <div className="p-3 border-b border-white/10">
        <p className="font-semibold text-white">
          Messages ({unreadMessages} unread)
        </p>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer transition ${
              !msg.read ? "bg-blue-500/10" : ""
            }`}
          >
            <p className="text-sm text-white">{msg.text}</p>
            <span className="text-xs text-gray-400">{msg.time}</span>
            {!msg.read && (
              <span className="ml-2 text-xs bg-[#ffa301] text-[#052954] px-2 py-0.5 rounded-full">
                New
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Render notifications dropdown
  const renderNotificationsDropdown = () => (
    <div
  className="
    absolute
    top-full
    mt-3

    left-1/2
    -translate-x-1/2

    md:left-auto
    md:right-0
    md:translate-x-0

    w-[95vw]
    sm:w-80
    max-w-sm

    max-h-[80vh]
    overflow-y-auto

    bg-gradient-to-br from-[#052954] to-[#041e42]
    shadow-xl
    rounded-lg
    border border-white/10
    z-50
  "
>

      {/* Header */}
      <div className="p-3 border-b border-white/10 flex justify-between items-center">
        <div>
          <p className="font-semibold text-white flex items-center gap-2">
            <FaBullhorn className="text-[#ffa301]" />
            Announcements ({notificationCount} new)
          </p>
          <p className="text-xs text-gray-400 mt-1">Latest school updates</p>
        </div>
        {notificationCount > 0 && (
          <button
            onClick={markAllAsWatched}
            className="text-xs bg-[#ffa301] text-[#052954] px-3 py-1 rounded-full hover:bg-[#ffa301]/90 transition"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div className="max-h-[60vh] overflow-y-auto">
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`border-b border-white/5 p-4 hover:bg-white/5 transition ${
                !announcement.watched ? "bg-blue-500/10" : ""
              }`}
            >
              {/* Announcement Header */}
              <div className="flex items-start gap-3 mb-2">
                <div className="flex-shrink-0">
                  {announcement.image ? (
                    <img
                      src={announcement.image}
                      alt={announcement.title}
                      className="w-10 h-10 object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                      <FaBullhorn className="text-[#ffa301] text-lg" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {announcement.title}
                    </h3>
                    {!announcement.watched && (
                      <span className="text-xs bg-[#ffa301] text-[#052954] px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
                        New
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-400">
                      By: {announcement.author?.firstName || "Admin"} {announcement.author?.lastName || ""}
                    </p>
                    <span className="text-gray-500">•</span>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <FaCalendarAlt className="text-xs" />
                      {formatDate(announcement.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Announcement Content */}
              <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                {announcement.description}
              </p>

              {/* Recipients */}
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-1">To:</p>
                <div className="flex flex-wrap gap-1">
                  {announcement.recipients?.roles?.map((role, index) => (
                    <span
                      key={index}
                      className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded-full"
                    >
                      {role === 'all' ? 'Everyone' : 
                       role === 'parent' ? 'Parents' :
                       role === 'teacher' ? 'Teachers' :
                       role === 'student' ? 'Students' :
                       role === 'admin' ? 'Admins' : role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  {announcement.channels?.email && (
                    <span className="text-xs text-blue-400">📧</span>
                  )}
                  {announcement.channels?.sms && (
                    <span className="text-xs text-green-400">💬</span>
                  )}
                  {announcement.channels?.inApp && (
                    <span className="text-xs text-purple-400">📱</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    announcement.deliveryStatus === 'sent' 
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {announcement.deliveryStatus}
                  </span>
                </div>
                <div className="flex gap-2">
                  {!announcement.watched && (
                    <button
                      onClick={() => markAsWatched(announcement.id)}
                      className="text-xs flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg transition"
                    >
                      <FaEye /> Mark read
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setActivePage("announcements");
                      setShowNotifications(false);
                    }}
                    className="text-xs text-[#ffa301] hover:text-[#ffa301]/80 transition"
                  >
                    View all
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBullhorn className="text-2xl text-[#ffa301]" />
            </div>
            <p className="text-gray-400">No announcements yet</p>
            <p className="text-sm text-gray-500 mt-1">Check back later for updates</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={() => {
            setActivePage("announcements");
            setShowNotifications(false);
          }}
          className="w-full py-2 text-center text-[#ffa301] hover:text-[#ffa301]/80 transition text-sm font-medium"
        >
          View all announcements →
        </button>
      </div>
    </div>
  );

  return (
    <>
      <nav className="fixed h-14 bg-gradient-to-r from-[#ffa301] to-[#ffa301]/90 shadow-lg flex items-center justify-between px-4 md:px-6 top-0 z-30 left-0 right-0 lg:left-64">
        {/* Left: Brand */}
        <div className="ml-14 md:ml-0">
          <h1 className="text-lg md:text-xl font-bold text-[#052954]">
            TriNova System
          </h1>
          <p className="text-xs text-[#052954]/80 hidden md:block">
            {adminData?.schoolName
              ? `${adminData.schoolName} Dashboard`
              : "School Management Dashboard"}
          </p>
        </div>

        {/* Right: Icons and Profile */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Messages Icon */}
          <div className="relative" ref={messageRef}>
            <button
              onClick={() => setShowMessages(!showMessages)}
              className="relative p-2 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Messages"
            >
              <FaEnvelope className="text-xl text-[#052954]" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
            </button>
            {showMessages && renderMessagesDropdown()}
          </div>

          {/* Notifications Icon */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) {
                  // Refresh announcements when opening notifications
                  fetchAnnouncements();
                }
              }}
              className="relative p-2 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Notifications"
            >
              <FaBell className="text-xl text-[#052954]" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
            {showNotifications && renderNotificationsDropdown()}
          </div>

          {/* Profile Icon */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Profile"
            >
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white shadow-lg overflow-hidden">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={adminName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                      <FaUser className="text-xl text-white" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#052954] rounded-full border-2 border-white"></div>
              </div>

              {/* Show admin name on desktop */}
              {!isMobile && adminName && adminName !== "Admin" && (
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-[#052954]">
                    {adminName}
                  </p>
                  <p className="text-xs text-[#052954]/70">{schoolName}</p>
                </div>
              )}
            </button>

            {showProfile && renderProfileDropdown()}
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-3 left-3 z-40 lg:hidden bg-[#052954] text-white p-2 rounded-lg shadow-lg"
        aria-label="Toggle sidebar"
      >
        {isSidebarOpen ? "✕" : "☰"}
      </button>

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @media (max-width: 640px) {
          .max-h-80 {
            max-height: 60vh;
          }
        }
      `}</style>
    </>
  );
};

export default TopNavbar;