// MainDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from "recharts";
import { 
  FaUsers, FaChalkboardTeacher, FaUserFriends, 
  FaDollarSign, FaCalendarAlt, FaChartLine, 
  FaGraduationCap, FaUser, FaBuilding, FaEnvelope,
  FaPhone, FaSignOutAlt, FaShieldAlt, FaBook
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from '../../../context/AuthContext';

const MainDashboard = () => {
  // State Management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeOfDay, setTimeOfDay] = useState('');
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();

  // Initialize on component mount
  useEffect(() => {
    fetchAdminData();
    setTimeOfDay(getGreetingTime());
  }, []);

  // Get time-based greeting
  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };

  // Fetch admin data from localStorage
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

  // Logout handler
  const Logout = () => {
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

  // Calendar generation
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({ date: prevMonthLastDay - i, isCurrentMonth: false, isToday: false });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = today.getDate() === i && 
                     today.getMonth() === month && 
                     today.getFullYear() === year;
      days.push({ date: i, isCurrentMonth: true, isToday });
    }
    
    // Next month days
    const totalCells = 35;
    const nextMonthDays = totalCells - days.length;
    for (let i = 1; i <= nextMonthDays; i++) {
      days.push({ date: i, isCurrentMonth: false, isToday: false });
    }
    
    return days;
  };

  // Navigation between months
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      direction === 'prev' 
        ? newDate.setMonth(prev.getMonth() - 1)
        : newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  // Top statistics data
  const topStats = [
    { 
      title: "Total Students", 
      value: "0", 
      icon: <FaUsers className="text-[#ffa301]" />,
      change: "+0%",
      detail: `At ${adminData?.schoolName || 'Your School'}`
    },
    { 
      title: "Teachers", 
      value: "0", 
      icon: <FaChalkboardTeacher className="text-[#ffa301]" />,
      change: "+0%",
      detail: "Active staff"
    },
    { 
      title: "Active Classes", 
      value: "0", 
      icon: <FaUserFriends className="text-[#ffa301]" />,
      change: "+0%",
      detail: "This week"
    },
    { 
      title: "School Revenue", 
      value: "$0.00", 
      icon: <FaDollarSign className="text-[#ffa301]" />,
      change: "+0%",
      detail: "This month"
    },
  ];

  // Chart data
  const studentData = [
    { grade: "Grade 1", students: 100, color: "#ffa301" },
    { grade: "Grade 2", students: 120, color: "#052954" },
    { grade: "Grade 3", students: 90, color: "#ffa301" },
    { grade: "Grade 4", students: 170, color: "#052954" },
    { grade: "Grade 5", students: 130, color: "#ffa301" },
    { grade: "Grade 6", students: 130, color: "#052954" },
  ];

  const genderData = [
    { name: "Female", value: 200, color: "#ffa301" },
    { name: "Male", value: 300, color: "#052954" },
  ];

  // Calendar data
  const calendarDays = generateCalendar();
  const monthNames = ["January", "February", "March", "April", "May", "June", 
                     "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#052954]/5 to-[#052954]/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ffa301] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Extract admin information
  const adminName = `${adminData?.firstName || ''} ${adminData?.lastName || ''}`.trim() || 'Admin';
  const schoolName = adminData?.schoolName || 'Your School';
  const adminEmail = adminData?.email || 'Not available';
  const adminPhone = adminData?.phone || 'Not provided';
  const profileImage = adminData?.profileImage;

  return (
    <div className="min-h-[100vh] bg-gradient-to-br from-[#052954]/5 to-[#052954]/10 p-4 md:p-6 overflow-y-auto">
      {/* Header Section */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Admin Info */}
          <div className="flex items-center gap-4">
            
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#052954]">
                Good {timeOfDay}, {adminName}!
              </h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <FaBuilding className="text-[#ffa301]" />
                {schoolName} Administrator
              </p>
            </div>
          </div>
          
          {/* Date and Logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-[#052954] to-[#052954]/80 px-4 py-2 rounded-full shadow-sm">
              <FaCalendarAlt className="text-[#ffa301]" />
              <span className="text-white font-medium">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <button
              onClick={authLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>


        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">{stat.title}</p>
                  <p className="text-xl font-bold text-[#052954] mb-2">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.detail}</p>
                </div>
                <div className="p-4 rounded-full bgc">
                  <div className="text-3xl">{stat.icon}</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm text-green-600">{stat.change} from last month</span>
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Distribution Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#052954]">Student Distribution by Grade</h2>
                <p className="text-gray-600">Enrollment across different grades at {schoolName}</p>
              </div>
              <FaGraduationCap className="text-[#052954] text-2xl" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="grade" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <Tooltip 
                    formatter={(value) => [`${value.toLocaleString()} students`, '']}
                    contentStyle={{ 
                      background: '#ffffff',
                      borderRadius: '8px', 
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="students" radius={[8, 8, 0, 0]} animationDuration={1500}>
                    {studentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gender Distribution Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#052954]">Gender Distribution</h2>
                <p className="text-gray-600">Total student population at {schoolName}</p>
              </div>
              <FaChartLine className="text-[#052954] text-2xl" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    animationBegin={500}
                    animationDuration={1500}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value.toLocaleString()} students`, '']}
                    contentStyle={{ 
                      background: '#ffffff',
                      borderRadius: '8px', 
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ paddingLeft: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar - Calendar & Actions */}
        <div className="space-y-6">
          {/* Calendar */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#052954]">Calendar</h2>
                  <p className="text-gray-600">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => navigateMonth('prev')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-[#052954]">
                    &lt;
                  </button>
                  <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 bg-[#052954] text-white text-sm rounded-lg font-medium hover:bg-[#052954]/90">
                    Today
                  </button>
                  <button onClick={() => navigateMonth('next')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-[#052954]">
                    &gt;
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-4">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">{day}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1 md:gap-2 p-2">
                {calendarDays.map((day, index) => {
                  const isSelected = day.isCurrentMonth && selectedDate.getDate() === day.date && selectedDate.getMonth() === currentDate.getMonth();
                  const today = new Date();
                  const isToday = day.isCurrentMonth && today.getDate() === day.date && today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

                  return (
                    <button
                      key={index}
                      onClick={() => day.isCurrentMonth && setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date))}
                      disabled={!day.isCurrentMonth}
                      className={`
                        relative h-10 md:h-12 w-10 md:w-12 rounded-full flex items-center justify-center text-sm md:text-base font-medium transition-all duration-300
                        ${!day.isCurrentMonth ? 'cursor-default opacity-30' : 'cursor-pointer hover:scale-110'}
                        ${isSelected ? 'bg-[#ffa301] text-[#052954] shadow-lg shadow-[#ffa301]/40 transform scale-105' : 
                          isToday ? 'bg-[#052954] text-white shadow-lg shadow-[#052954]/30' :
                          day.isCurrentMonth ? 'text-[#052954] hover:bg-[#052954]/5 hover:text-[#052954] border border-transparent hover:border-[#052954]/20' :
                          'text-gray-400'}
                      `}
                    >
                      {day.date}
                      {isSelected && <div className="absolute inset-0 rounded-full ring-2 ring-[#ffa301] ring-offset-2"></div>}
                      {isToday && !isSelected && <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#ffa301]"></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-[#052954] to-[#052954]/90 rounded-2xl p-6 shadow-lg">
            <h3 className="text-white text-lg font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors flex items-center text-white">
                <FaUsers className="mr-3" /> Manage Students
              </button>
              <button className="w-full text-left p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors flex items-center text-white">
                <FaChalkboardTeacher className="mr-3" /> Manage Teachers
              </button>
              <button className="w-full text-left p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors flex items-center text-white">
                <FaChartLine className="mr-3" /> View Reports
              </button>
              <button className="w-full text-left p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors flex items-center text-white">
                <FaBuilding className="mr-3" /> School Settings
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Summary */}
      <footer className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-[#052954] mb-4">School Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#052954]/10 mb-3">
              <FaGraduationCap className="text-[#052954] text-xl" />
            </div>
            <h4 className="font-bold text-[#052954] mb-1">Welcome to {schoolName}</h4>
            <p className="text-gray-600 text-sm">School Administrator: {adminName}</p>
            <p className="text-gray-600 text-sm mt-2">Email: {adminEmail}</p>
          </div>
          
          <div className="text-center md:text-left">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#ffa301]/10 mb-3">
              <FaChalkboardTeacher className="text-[#ffa301] text-xl" />
            </div>
            <h4 className="font-bold text-[#052954] mb-1">Current Statistics</h4>
            <p className="text-gray-600 text-sm">1,500 enrolled students across 6 grades</p>
            <p className="text-gray-600 text-sm">45 teaching staff members</p>
          </div>
          
          <div className="text-center md:text-left">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#052954]/10 mb-3">
              <FaUser className="text-[#052954] text-xl" />
            </div>
            <h4 className="font-bold text-[#052954] mb-1">Your Role</h4>
            <p className="text-gray-600 text-sm">Full administrative access to school management</p>
            <p className="text-gray-600 text-sm">Account created recently</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainDashboard;