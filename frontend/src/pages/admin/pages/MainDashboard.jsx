// MainDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";
import { 
  FaUsers, FaChalkboardTeacher, FaUserFriends, 
  FaDollarSign, FaCalendarAlt, FaBell, 
  FaChartLine, FaGraduationCap, FaBook,
  FaArrowUp, FaCaretRight, FaUser, FaBuilding, FaEnvelope,
  FaPhone, FaSignOutAlt, FaSpinner, FaShieldAlt
} from "react-icons/fa";
import { superAdminService } from "../../../services/superAdminService";
import axios from "axios";
import { toast } from "react-toastify";

const MainDashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeOfDay, setTimeOfDay] = useState('');
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch admin data
  useEffect(() => {
    fetchAdminData();
    
    // Get time of day greeting
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('Morning');
    else if (hour < 18) setTimeOfDay('Afternoon');
    else setTimeOfDay('Evening');
  }, []);

  // In fetchAdminData function in MainDashboard.jsx
const fetchAdminData = async () => {
  try {
    setLoading(true);
    
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userStr || !token) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }
    
    const user = JSON.parse(userStr);
    
    // First, get the list of schools
    try {
      const schoolsResponse = await superAdminService.listSchools();
      const schools = schoolsResponse.data || schoolsResponse;
      
      // Find the school that matches the admin's school ID
      const adminSchool = schools.find(school => school._id === user.school);
      
      // Create admin info with school name
      const adminInfo = {
        ...user,
        firstName: user.firstName || 'Admin',
        lastName: user.lastName || '',
        phone: user.phone || '',
        profileImage: user.profileImage || '',
        // School info from matched school
        schoolId: user.school,
        schoolName: adminSchool?.name || 'Your School',
        schoolCode: adminSchool?.code || '',
        schoolEmail: adminSchool?.email || '',
        schoolPhone: adminSchool?.phone || '',
        schoolAddress: adminSchool?.address || '',
      };
      
      setAdminData(adminInfo);
      
    } catch (schoolsError) {
      
      // Fallback: Use what you have
      const adminInfo = {
        ...user,
        firstName: user.firstName || 'Admin',
        lastName: user.lastName || '',
        phone: user.phone || '',
        schoolId: user.school,
        schoolName: 'Your School',
        schoolCode: '',
      };
      
      setAdminData(adminInfo);
    }
    
  } catch (error) {
    console.error("Error fetching admin data:", error);
    
    // Final fallback
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setAdminData({
        ...user,
        firstName: 'Admin',
        lastName: 'User',
        schoolName: 'Your School'
      });
    }
  } finally {
    setLoading(false);
  }
};

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // Generate calendar
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = today.getDate() === i && 
                     today.getMonth() === month && 
                     today.getFullYear() === year;
      days.push({
        date: i,
        isCurrentMonth: true,
        isToday: isToday
      });
    }
    
    // Next month
    const totalCells = 35;
    const nextMonthDays = totalCells - days.length;
    for (let i = 1; i <= nextMonthDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendar();
  const monthNames = ["January", "February", "March", "April", "May", "June", 
                     "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Dynamic stats based on admin data
  const getTopStats = () => {
    const schoolName = localStorage.getItem('createdSchoolName') || 'Your School';
    
    return [
      { 
        title: "Total Students", 
        value: "1,500", 
        icon: <FaUsers className="text-[#ffa301]" />,
        color: "bg-[#052954]/10",
        textColor: "text-[#052954]",
        change: "+12%",
        trend: "up",
        detail: `At ${schoolName}`
      },
      { 
        title: "Teachers", 
        value: "45", 
        icon: <FaChalkboardTeacher className="text-[#ffa301]" />,
        color: "bg-[#052954]/10",
        textColor: "text-[#052954]",
        change: "+5%",
        trend: "up",
        detail: "Active staff"
      },
      { 
        title: "Active Classes", 
        value: "32", 
        icon: <FaUserFriends className="text-[#ffa301]" />,
        color: "bg-[#052954]/10",
        textColor: "text-[#052954]",
        change: "+8%",
        trend: "up",
        detail: "This week"
      },
      { 
        title: "School Revenue", 
        value: "$45K", 
        icon: <FaDollarSign className="text-[#ffa301]" />,
        color: "bg-[#052954]/10",
        textColor: "text-[#052954]",
        change: "+18%",
        trend: "up",
        detail: "This month"
      },
    ];
  };

  // Student data for charts
  const studentData = [
    { grade: "Grade 1", students: 220, color: "#ffa301" },
    { grade: "Grade 2", students: 240, color: "#052954" },
    { grade: "Grade 3", students: 260, color: "#ffa301" },
    { grade: "Grade 4", students: 280, color: "#052954" },
    { grade: "Grade 5", students: 250, color: "#ffa301" },
    { grade: "Grade 6", students: 230, color: "#052954" },
  ];

  const genderData = [
    { name: "Female", value: 620, color: "#ffa301" },
    { name: "Male", value: 880, color: "#052954" },
  ];

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

  if (!adminData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#052954]/5 to-[#052954]/10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Admin Data Found</h2>
          <button
            onClick={() => navigate("/login")}
            className="bg-[#ffa301] text-white px-6 py-3 rounded-lg hover:bg-[#ffa301]/90 font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const topStats = getTopStats();
  const adminName = `${adminData.firstName || ''} ${adminData.lastName || ''}`.trim() || 'Admin';
  const schoolName = adminData.school?.name || adminData.schoolName || adminData.school || 'Your School';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#052954]/5 to-[#052954]/10 p-4 md:p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Admin Profile Picture */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200">
                {adminData.profileImage ? (
                  <img
                    src={adminData.profileImage}
                    alt={adminName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaUser className="text-3xl text-blue-600" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 p-2 bg-[#ffa301] text-white rounded-full shadow-lg">
                <FaShieldAlt className="text-sm" />
              </div>
            </div>
            
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
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>

        {/* Admin Info Quick View */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-lg border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#052954]/10 rounded-lg">
                <FaEnvelope className="text-[#052954]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-sm truncate">{adminData.email || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#ffa301]/10 rounded-lg">
                <FaPhone className="text-[#ffa301]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium text-sm">{adminData.phone || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#052954]/10 rounded-lg">
                <FaShieldAlt className="text-[#052954]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Role</p>
                <p className="font-medium text-sm">Administrator</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#ffa301]/10 rounded-lg">
                <FaBuilding className="text-[#ffa301]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">School Code</p>
                <p className="font-medium text-sm">{adminData.school?.code || adminData.schoolId || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topStats.map((stat, index) => (
            <div 
              key={stat.title}
              className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">{stat.title}</p>
                  <p className="text-xl font-bold text-[#052954] mb-2">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.detail}</p>
                </div>
                <div className={`p-4 rounded-full bg-gradient-to-br from-[#052954]/10 to-[#052954]/5`}>
                  <div className="text-3xl">
                    {stat.icon}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${stat.trend === 'up' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last month
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column - Student Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Distribution by Grade */}
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
                  <XAxis 
                    dataKey="grade" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b' }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value.toLocaleString()} students`, '']}
                    contentStyle={{ 
                      background: '#ffffff',
                      borderRadius: '8px', 
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="students" 
                    radius={[8, 8, 0, 0]}
                    animationDuration={1500}
                  >
                    {studentData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        className="hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Student Gender Distribution */}
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
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
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
                  <Legend 
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ paddingLeft: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column - Calendar & Quick Actions */}
        <div className="space-y-6">
          {/* Interactive Calendar */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#052954]">Calendar</h2>
                  <p className="text-gray-600">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-[#052954]"
                  >
                    &lt;
                  </button>
                  <button 
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-1 bg-[#052954] text-white text-sm rounded-lg transition-colors font-medium hover:bg-[#052954]/90"
                  >
                    Today
                  </button>
                  <button 
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-[#052954]"
                  >
                    &gt;
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-4">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1 md:gap-2 p-2">
                {calendarDays.map((day, index) => {
                  const isSelected = day.isCurrentMonth && 
                                   selectedDate.getDate() === day.date && 
                                   selectedDate.getMonth() === currentDate.getMonth();
                  
                  const today = new Date();
                  const isToday = day.isCurrentMonth && 
                                 today.getDate() === day.date && 
                                 today.getMonth() === currentDate.getMonth() && 
                                 today.getFullYear() === currentDate.getFullYear();

                  return (
                    <button
                      key={index}
                      onClick={() => day.isCurrentMonth && setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date))}
                      disabled={!day.isCurrentMonth}
                      className={`
                        relative
                        h-10 md:h-12 w-10 md:w-12
                        rounded-full
                        flex items-center justify-center
                        text-sm md:text-base font-medium
                        transition-all duration-300
                        ${!day.isCurrentMonth ? 'cursor-default opacity-30' : 'cursor-pointer hover:scale-110'}
                        ${isSelected 
                          ? 'bg-[#ffa301] text-[#052954] shadow-lg shadow-[#ffa301]/40 transform scale-105'
                          : isToday
                            ? 'bg-[#052954] text-white shadow-lg shadow-[#052954]/30'
                            : day.isCurrentMonth
                              ? 'text-[#052954] hover:bg-[#052954]/5 hover:text-[#052954] border border-transparent hover:border-[#052954]/20'
                              : 'text-gray-400'
                        }
                      `}
                    >
                      {day.date}
                      
                      {/* Selected indicator ring */}
                      {isSelected && (
                        <div className="absolute inset-0 rounded-full ring-2 ring-[#ffa301] ring-offset-2"></div>
                      )}
                      
                      {/* Today indicator */}
                      {isToday && !isSelected && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#ffa301]"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Actions for Admin */}
          <div className="bg-gradient-to-br from-[#052954] to-[#052954]/90 rounded-2xl p-6 shadow-lg">
            <h3 className="text-white text-lg font-bold mb-4">Quick Actions</h3>
            <div className="space-y-4">
              <button 
                onClick={() => navigate("/manage-students")}
                className="w-full text-left p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors flex items-center text-white"
              >
                <FaUsers className="mr-3" />
                Manage Students
              </button>
              
              <button 
                onClick={() => navigate("/manage-teachers")}
                className="w-full text-left p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors flex items-center text-white"
              >
                <FaChalkboardTeacher className="mr-3" />
                Manage Teachers
              </button>
              
              <button 
                onClick={() => navigate("/reports")}
                className="w-full text-left p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors flex items-center text-white"
              >
                <FaChartLine className="mr-3" />
                View Reports
              </button>
              
              <button 
                onClick={() => navigate("/school-settings")}
                className="w-full text-left p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors flex items-center text-white"
              >
                <FaBuilding className="mr-3" />
                School Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* School Summary */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-[#052954] mb-4">School Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#052954]/10 mb-3">
              <FaGraduationCap className="text-[#052954] text-xl" />
            </div>
            <h4 className="font-bold text-[#052954] mb-1">Welcome to {schoolName}</h4>
            <p className="text-gray-600 text-sm">
              School Administrator: {adminName}
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Email: {adminData.email}
            </p>
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
            <p className="text-gray-600 text-sm">System access granted on: {adminData.createdAt ? new Date(adminData.createdAt).toLocaleDateString() : 'Recently'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;