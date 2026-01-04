import { useState, useRef, useEffect } from "react";
import {
  FaEnvelope,
  FaBell,
  FaUser,
  FaTasks,
  FaCog,
  FaSignOutAlt,
  FaUserCircle
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from '../../../context/AuthContext';

const TopNavbar = ({ setActivePage, toggleSidebar, isSidebarOpen }) => {
  // State
  const [showProfile, setShowProfile] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  
  // Refs
  const profileRef = useRef();
  const messageRef = useRef();
  const notificationRef = useRef();
  
  // Navigation
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();

  // Messages data
  const messages = [
    { id: 1, text: "New student registration request", time: "10 min ago", read: false },
    { id: 2, text: "Parent meeting scheduled", time: "1 hour ago", read: true },
    { id: 3, text: "Monthly report ready", time: "2 hours ago", read: false },
    { id: 4, text: "System update notification", time: "Yesterday", read: true },
  ];

  // NEW: Get admin data using email-based storage
   const fetchAdminData = async () => {
      try {
        setLoading(true);
        
        // 1. First check for complete admin data stored during creation
        const storedCompleteAdmin = localStorage.getItem('currentAdmin');
        
        if (storedCompleteAdmin) {
          try {
            const completeAdmin = JSON.parse(storedCompleteAdmin);
            console.log("✅ Using complete admin data from localStorage:", completeAdmin);
            
            // Extract data from response structure
            const adminInfo = {
              // Data from the response.data object
              ...(completeAdmin.data || {}),
              // Override with top-level properties
              ...completeAdmin,
              // Ensure we don't have duplicate message field
              message: undefined
            };
            
            // Clean up the object
            delete adminInfo.message;
            
            setAdminData(adminInfo);
            return;
          } catch (parseError) {
            console.error("Error parsing currentAdmin:", parseError);
          }
        }
        
        // 2. Fallback to user data from login
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!userStr || !token) {
          toast.error("Please login first");
          navigate("/login");
          return;
        }
        
        const user = JSON.parse(userStr);
        console.log("Using user data from login:", user);
        
        // Get school name from localStorage
        const schoolName = localStorage.getItem("createdSchoolName") || 'Your School';
        
        // Create admin info object
        const adminInfo = {
          ...user,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phone || '',
          profileImage: user.profileImage || '',
          schoolId: user.school || '',
          schoolName: schoolName,
          email: user.email || '',
        };
        
        setAdminData(adminInfo);
        
      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast.error("Failed to load admin data");
        
        // Ultimate fallback
        setAdminData({
          firstName: 'Admin',
          lastName: 'User',
          schoolName: 'Your School',
          email: 'admin@school.edu'
        });
      } finally {
        setLoading(false);
      }
    };

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/annouce.json");
      const data = await response.json();
      setAnnouncements(data.announce || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setAnnouncements([]);
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
    
    return () => window.removeEventListener("resize", checkScreen);
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
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // In TopNavbar.jsx - update handleLogout function
const handleLogout = () => {
  try {
    // Clear session data only
    const currentEmail = localStorage.getItem('currentActiveEmail');
    if (currentEmail) {
      localStorage.removeItem(`currentAdmin_${currentEmail}`);
      localStorage.removeItem(`token_${currentEmail}`);
    }
    
    // Clear general session data
    localStorage.removeItem('currentActiveEmail');
    localStorage.removeItem('token');
    localStorage.removeItem('currentAdmin');
    
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
    ? `${adminData.firstName || ''} ${adminData.lastName || ''}`.trim() 
    : 'Admin';
  
  const schoolName = adminData?.schoolName || 'Your School';
  const adminEmail = adminData?.email || 'Not available';
  const profileImage = adminData?.profileImage;

  // Unread counts
  const unreadMessages = messages.filter(msg => !msg.read).length;
  const unreadAnnouncements = announcements.length;

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
    <div className="
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
    ">
      <div className="p-3 border-b border-white/10">
        <p className="font-semibold text-white">Messages ({unreadMessages} unread)</p>
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer transition ${
              !msg.read ? 'bg-blue-500/10' : ''
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
    <div className="
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
    ">
      <div className="p-3 border-b border-white/10">
        <p className="font-semibold text-white">Notifications ({unreadAnnouncements})</p>
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        {announcements.length > 0 ? (
          announcements.map((ann) => (
            <div key={ann.id} className="border-b border-white/5 p-4 hover:bg-white/5">
              {/* Announcement Header */}
              <div className="flex items-start gap-3 mb-2">
                <div className="flex-shrink-0">
                  {ann.image ? (
                    <img
                      src={ann.image}
                      alt={ann.title}
                      className="w-10 h-10 object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                      <FaUserCircle className="text-[#ffa301] text-xl" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white">{ann.title}</h3>
                  <p className="text-xs text-gray-400">By: {ann.author}</p>
                </div>
              </div>
              
              {/* Announcement Content */}
              <p className="text-sm text-gray-300 mb-2">{ann.description}</p>
              
              {/* Footer */}
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>{ann.date}</span>
                <span className="text-[#ffa301]">New</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center">
            <p className="text-gray-400">No announcements</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <nav className="relative h-14 bg-gradient-to-r from-[#ffa301] to-[#ffa301]/90 shadow-lg flex items-center justify-between px-4 md:px-6 top-0 z-30">
      {/* Left: Brand */}
      <div className="ml-16 md:ml-0">
        <h1 className="text-lg md:text-xl font-bold text-[#052954]">TriNova System</h1>
        <p className="text-xs text-[#052954]/80 hidden md:block">
          {adminData?.schoolName ? `${adminData.schoolName} Dashboard` : 'School Management Dashboard'}
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
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Notifications"
          >
            <FaBell className="text-xl text-[#052954]" />
            {unreadAnnouncements > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {unreadAnnouncements}
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
            {!isMobile && adminName && adminName !== 'Admin' && (
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-[#052954]">{adminName}</p>
                <p className="text-xs text-[#052954]/70">{schoolName}</p>
              </div>
            )}
          </button>
          
          {showProfile && renderProfileDropdown()}
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;