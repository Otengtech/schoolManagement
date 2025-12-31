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
              Good {timeOfDay}, Admin!
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column - Student Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Distribution by Grade */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#052954]">Student Distribution by Grade</h2>
                <p className="text-gray-600">Enrollment across different grades</p>
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
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#ffa301] mr-2"></div>
                  <span className="text-sm text-gray-600">Primary Grades</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#052954] mr-2"></div>
                  <span className="text-sm text-gray-600">Secondary Grades</span>
                </div>
              </div>
              <button className="flex items-center text-[#052954] font-medium hover:text-[#052954]/80 transition-colors">
                View Details <FaCaretRight className="ml-2" />
              </button>
            </div>
          </div>

          {/* Student Gender Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#052954]">Gender Distribution</h2>
                <p className="text-gray-600">Total student population breakdown</p>
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

        {/* Right Column - Calendar */}
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
                    className=" text-gray-700 text-sm transition-colors font-medium"
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
            ? 'bg-[#ffa301] text-[#052954] shadow-lg shadow-[#ffa301]/40 transform scale-105'  // Yellow for selected
            : isToday
              ? 'bg-[#052954] text-white shadow-lg shadow-[#052954]/30'  // Dark blue for today
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

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-[#052954] to-[#052954]/90 rounded-2xl p-6 shadow-lg">
            <h3 className="text-white text-lg font-bold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mr-3">
                    <FaBook className="text-white" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Classes Today</p>
                    <p className="text-white font-bold">42 Active</p>
                  </div>
                </div>
                <div className="text-white/60 text-sm">↗ 85%</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mr-3">
                    <FaUsers className="text-white" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Attendance Rate</p>
                    <p className="text-white font-bold">94.2%</p>
                  </div>
                </div>
                <div className="text-white/60 text-sm">↗ 2.3%</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mr-3">
                    <FaDollarSign className="text-white" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Revenue Today</p>
                    <p className="text-white font-bold">$8,450</p>
                  </div>
                </div>
                <div className="text-[#ffa301] text-sm font-medium">+ $1,230</div>
              </div>
            </div>
            
            <button className="w-full mt-6 py-3 bg-[#ffa301] text-white font-medium rounded-full hover:bg-[#ffa301]/90 transition-colors flex items-center justify-center">
              View Full Report
              <FaCaretRight className="ml-2" />
            </button>
          </div>
        </div>
      </div>

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