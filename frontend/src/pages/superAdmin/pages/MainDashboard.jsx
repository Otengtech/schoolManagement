// MainDashboard.jsx
import React, { useState, useEffect } from "react";
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";
import { 
  FaUsers, FaChalkboardTeacher, FaUserFriends, 
  FaDollarSign, FaCalendarAlt, FaBell, 
  FaChartLine, FaGraduationCap, FaBook,
  FaArrowUp, FaCaretRight
} from "react-icons/fa";

const MainDashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeOfDay, setTimeOfDay] = useState('');

  // Top Stats Data with your colors
  const topStats = [
    { 
      title: "Total Students", 
      value: "150,000", 
      icon: <FaUsers className="text-[#ffa301]" />,
      color: "bg-[#052954]/10",
      textColor: "text-[#052954]",
      change: "+12%",
      trend: "up",
      detail: "Active: 142,500"
    },
    { 
      title: "Teachers", 
      value: "2,250", 
      icon: <FaChalkboardTeacher className="text-[#ffa301]" />,
      color: "bg-[#052954]/10",
      textColor: "text-[#052954]",
      change: "+5%",
      trend: "up",
      detail: "Available: 2,150"
    },
    { 
      title: "Parents", 
      value: "5,690", 
      icon: <FaUserFriends className="text-[#ffa301]" />,
      color: "bg-[#052954]/10",
      textColor: "text-[#052954]",
      change: "+8%",
      trend: "up",
      detail: "Engaged: 5,200"
    },
    { 
      title: "Earnings", 
      value: "$193K", 
      icon: <FaDollarSign className="text-[#ffa301]" />,
      color: "bg-[#052954]/10",
      textColor: "text-[#052954]",
      change: "+18%",
      trend: "up",
      detail: "Monthly Average"
    },
  ];

  // Student Enrollment by Grade
  const studentData = [
    { grade: "Grade 1", students: 22000, color: "#ffa301" },
    { grade: "Grade 2", students: 24000, color: "#052954" },
    { grade: "Grade 3", students: 26000, color: "#ffa301" },
    { grade: "Grade 4", students: 28000, color: "#052954" },
    { grade: "Grade 5", students: 25000, color: "#ffa301" },
    { grade: "Grade 6", students: 23000, color: "#052954" },
    { grade: "Grade 7", students: 21000, color: "#ffa301" },
    { grade: "Grade 8", students: 19000, color: "#052954" },
  ];

  // Student Gender Distribution
  const genderData = [
    { name: "Female", value: 62000, color: "#ffa301" },
    { name: "Male", value: 88000, color: "#052954" },
  ];

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

  // Get time of day greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('Morning');
    else if (hour < 18) setTimeOfDay('Afternoon');
    else setTimeOfDay('Evening');
  }, []);

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

  // Calendar events for selected date
  const calendarEvents = [
    { time: "09:00 AM", title: "Math Class - Grade 5", type: "class" },
    { time: "11:00 AM", title: "Parent Meeting", type: "meeting" },
    { time: "02:00 PM", title: "Science Fair Setup", type: "event" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#052954]/5 to-[#052954]/10 p-4 md:p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#052954]">
              Good {timeOfDay}, Super Admin!
            </h1>
            <p className="text-gray-600 mt-1">Here's your dashboard overview</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bgc px-4 py-2 rounded-full shadow-sm">
              <FaCalendarAlt className="yellow" />
              <span className="text-white font-medium">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
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
                </div>
                <div className={`p-4 rounded-full bgc`}>
                  <div className="text-4xl">
                    {stat.icon}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      

      {/* Bottom Info */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#052954]/10 mb-3">
              <FaGraduationCap className="text-[#052954] text-xl" />
            </div>
            <h4 className="font-bold text-[#052954] mb-1">Student Enrollment Growth</h4>
            <p className="text-gray-600 text-sm">12% increase from last year with 18,000 new students</p>
          </div>
          
          <div className="text-center md:text-left">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#ffa301]/10 mb-3">
              <FaChalkboardTeacher className="text-[#ffa301] text-xl" />
            </div>
            <h4 className="font-bold text-[#052954] mb-1">Teacher Performance</h4>
            <p className="text-gray-600 text-sm">Average satisfaction rating: 4.8/5.0 across all departments</p>
          </div>
          
          <div className="text-center md:text-left">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#052954]/10 mb-3">
              <FaUserFriends className="text-[#052954] text-xl" />
            </div>
            <h4 className="font-bold text-[#052954] mb-1">Parent Engagement</h4>
            <p className="text-gray-600 text-sm">85% of parents actively participating in school activities</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;