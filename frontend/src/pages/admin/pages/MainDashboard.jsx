// MainDashboard.jsx
import React from "react";
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";
import { 
  FaUsers, FaChalkboardTeacher, FaUserFriends, 
  FaDollarSign, FaMoneyBillWave, FaCalendarAlt, 
  FaBell, FaChartLine, FaGraduationCap 
} from "react-icons/fa";

const MainDashboard = () => {
  // Top Stats Data
  const topStats = [
    { 
      title: "Students", 
      value: "150,000", 
      icon: <FaUsers className="text-blue-500" />,
      color: "bg-blue-50",
      textColor: "text-blue-600",
      change: "+12%"
    },
    { 
      title: "Teachers", 
      value: "2,250", 
      icon: <FaChalkboardTeacher className="text-green-500" />,
      color: "bg-green-50",
      textColor: "text-green-600",
      change: "+5%"
    },
    { 
      title: "Parents", 
      value: "5,690", 
      icon: <FaUserFriends className="text-purple-500" />,
      color: "bg-purple-50",
      textColor: "text-purple-600",
      change: "+8%"
    },
    { 
      title: "Active Users", 
      value: "45,230", 
      icon: <FaUsers className="text-orange-500" />,
      color: "bg-orange-50",
      textColor: "text-orange-600",
      change: "+15%"
    },
  ];

  // Earnings vs Expenses Data
  const financialData = [
    { month: "Jan", earnings: 18500, expenses: 12500 },
    { month: "Feb", earnings: 12000, expenses: 8500 },
    { month: "Mar", earnings: 15000, expenses: 9200 },
    { month: "Apr", earnings: 22000, expenses: 11000 },
    { month: "May", earnings: 28000, expenses: 13500 },
    { month: "Jun", earnings: 32000, expenses: 15000 },
  ];

  // Students Data
  const studentsData = [
    { grade: "1st", students: 12000 },
    { grade: "2nd", students: 15000 },
    { grade: "3rd", students: 18000 },
    { grade: "4th", students: 22000 },
    { grade: "5th", students: 25000 },
    { grade: "6th", students: 27000 },
    { grade: "7th", students: 24000 },
    { grade: "8th", students: 21000 },
  ];

  // Students Gender Data
  const studentsGender = [
    { name: "Female", value: 45000, color: "#60A5FA" },
    { name: "Male", value: 105000, color: "#FBBF24" },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-200 h-full md:h-[85vh] md:overflow-y-auto md:scrollbar-hide">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>

      {/* Top Stats with Icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {topStats.map((stat) => (
          <div key={stat.title} className="bg-white shadow-md p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-evenly">
              <div className={`p-3 rounded-full ${stat.color}`}>
                <div className={`text-4xl ${stat.textColor}`}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-lg font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Earnings & Expenses and Students Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Earnings vs Expenses */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Earnings vs Expenses</h2>
            <FaMoneyBillWave className="text-green-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="earnings" 
                  stackId="1"
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stackId="1"
                  stroke="#EF4444" 
                  fill="#EF4444" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-gray-600">Earnings: $127,500</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span className="text-gray-600">Expenses: $69,700</span>
            </div>
          </div>
        </div>

        {/* Students Distribution */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Students Distribution</h2>
            <FaGraduationCap className="text-blue-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="students" 
                  fill="#3B82F6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gender Distribution Pie Chart */}
      <div className="mt-6 bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Student Gender Distribution</h2>
          <FaChartLine className="text-pink-500" />
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={studentsGender}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {studentsGender.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value.toLocaleString(), 'Students']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center space-x-6 mt-4">
          {studentsGender.map((gender) => (
            <div key={gender.name} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: gender.color }}
              ></div>
              <span className="text-sm text-gray-600">
                {gender.name}: {gender.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;