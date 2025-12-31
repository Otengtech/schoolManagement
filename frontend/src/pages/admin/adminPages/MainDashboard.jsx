import React, { useState, useEffect } from "react";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUserCheck,
  FaCalendarCheck,
  FaBell,
  FaSearch,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444"];

const MainDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentUsers, setRecentUsers] = useState([]);
  const [roleDistribution, setRoleDistribution] = useState([]);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const students = users.filter(u => u.role === "student").length;
    const teachers = users.filter(u => u.role === "teacher").length;
    const active = users.filter(u => u.status === "active").length;

    setStats({
      students,
      teachers,
      active,
      attendance: Math.floor(Math.random() * 30) + 70,
    });

    setRecentUsers(users.slice(-5).reverse());

    setRoleDistribution([
      { name: "Students", value: students },
      { name: "Teachers", value: teachers },
      { name: "Parents", value: users.filter(u => u.role === "parent").length },
      { name: "Admins", value: users.filter(u => u.role === "admin").length },
    ].filter(r => r.value > 0));
  }, []);

  const statCards = [
    { title: "Students", value: stats.students, icon: <FaUserGraduate />, color: "bg-indigo-50 text-indigo-600" },
    { title: "Teachers", value: stats.teachers, icon: <FaChalkboardTeacher />, color: "bg-blue-50 text-blue-600" },
    { title: "Active Users", value: stats.active, icon: <FaUserCheck />, color: "bg-green-50 text-green-600" },
    { title: "Attendance", value: `${stats.attendance}%`, icon: <FaCalendarCheck />, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Home Dashboard</h1>
          <p className="text-sm text-gray-500">School Management System</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2">
            <FaBell />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>

      {/* Compact Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {statCards.map((s, i) => (
          <div key={i} className="bg-white border rounded-lg p-3 flex items-center gap-3">
            <div className={`p-2 rounded-md ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-xs text-gray-500">{s.title}</p>
              <p className="text-lg font-semibold text-gray-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

        {/* User Growth */}
        <div className="bg-white border rounded-lg p-4 h-56 sm:h-64">
          <h3 className="text-sm font-semibold mb-2">User Growth</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[
              { m: "Jan", u: 120 },
              { m: "Feb", u: 150 },
              { m: "Mar", u: 190 },
              { m: "Apr", u: 230 },
              { m: "May", u: 280 },
            ]}>
              <XAxis dataKey="m" />
              <YAxis />
              <Tooltip />
              <Line dataKey="u" stroke="#6366F1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Role Distribution */}
        <div className="bg-white border rounded-lg p-4 h-56 sm:h-64">
          <h3 className="text-sm font-semibold mb-2">Role Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={roleDistribution}
                dataKey="value"
                outerRadius={70}
                label
              >
                {roleDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attendance + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        <div className="lg:col-span-2 bg-white border rounded-lg p-4 h-56 sm:h-64">
          <h3 className="text-sm font-semibold mb-2">Weekly Attendance</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { d: "Mon", p: 85 },
              { d: "Tue", p: 88 },
              { d: "Wed", p: 82 },
              { d: "Thu", p: 90 },
              { d: "Fri", p: 87 },
            ]}>
              <XAxis dataKey="d" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="p" fill="#22C55E" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
          <div className="flex lg:flex-col gap-2 overflow-x-auto">
            {["Add Student", "Schedule Class", "Send Notice"].map((a, i) => (
              <button
                key={i}
                className="whitespace-nowrap px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="p-4 border-b font-semibold text-sm">Recent Users</div>
        <table className="w-full text-sm">
          <tbody>
            {recentUsers.slice(0, window.innerWidth < 768 ? 3 : 5).map((u, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="p-3">{u.name || "Unknown"}</td>
                <td className="p-3 text-gray-500">{u.role}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    u.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default MainDashboard;
