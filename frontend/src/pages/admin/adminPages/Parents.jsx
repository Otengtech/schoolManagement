// pages/admin/AddUsers.jsx
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaFilter,
} from "react-icons/fa";

const Parents = () => {
  const [users, setUsers] = useState(() => {
  const savedUsers = localStorage.getItem("users");
  return savedUsers ? JSON.parse(savedUsers) : [];
});
  const [loading, setLoading] = useState(false);
  const [studentUsers, setStudentUsers] = useState([])
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
  const students = users.filter(user => user.role === "parent");
  setStudentUsers(students);
}, [users]);

  // Filtering
  const filteredUsers = studentUsers.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
            Teachers Dashboard
          </h1>
          <p className="text-sm lg:text-base text-gray-600">
            View all Teachers here
          </p>
        </div>
      </div>

      {/* Users Table Container */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Table Controls */}
        <div className="p-3 lg:p-4 border-b">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm lg:text-base"
                />
              </div>
            </div>

            {/* Filter Button for Desktop */}
            <div className="hidden lg:flex items-center gap-2 text-gray-600 cursor-pointer hover:text-gray-800">
              <FaFilter />
              <span>Filter</span>
            </div>
          </div>
        </div>

        {/* Table Container with Horizontal Scroll on Mobile */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] lg:min-w-0">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Sample data */}
              {currentUsers.map((user, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 lg:px-6 py-3 lg:py-4">
                    <div className="font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-3 lg:px-6 py-3 lg:py-4">
                    <div className="text-gray-700 text-sm lg:text-base truncate max-w-[150px] lg:max-w-none">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-3 lg:py-4">
                    <span className="inline-flex px-2 lg:px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-3 lg:px-6 py-3 lg:py-4">
                    <span className="inline-flex px-2 lg:px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View (for very small screens) */}
        <div className="lg:hidden divide-y divide-gray-200">
          {currentUsers.map((user, index) => (
            <div key={index} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 truncate">
                    {user.email}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {user.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 lg:mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">1</span> to{" "}
          <span className="font-medium">10</span> of{" "}
          <span className="font-medium">{studentUsers.length}</span> users
        </div>
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          {Array.from(
            { length: Math.ceil(users.length / usersPerPage) },
            (_, i) => i + 1
          ).map((number) => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              className={`px-3 py-1 border rounded ${
                currentPage === number ? "bg-black text-white" : "bg-white"
              }`}
            >
              {number}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, Math.ceil(users.length / usersPerPage))
              )
            }
            disabled={currentPage === Math.ceil(users.length / usersPerPage)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Parents;
