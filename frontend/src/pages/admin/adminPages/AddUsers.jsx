// pages/admin/AddUsers.jsx
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { 
  FaUserPlus, 
  FaEdit, 
  FaTrash, 
  FaEnvelope, 
  FaUserTag,
  FaSearch,
  FaFilter,
  FaBars,
  FaTimes,
  FaEllipsisV
} from "react-icons/fa";

const AddUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch ] = useState("")
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    password: "",
  });
const [currentPage, setCurrentPage] = useState(1);
const usersPerPage = 5;

  useEffect(()=>{
    fetch("/user.json")
  .then(res => res.json())
  .then(data => {
    setUsers(data.users)
  })
  .catch(err => console.error(err));
  })

useEffect(()=>{
  localStorage.setItem("users", JSON.stringify(users))
})

// Filtering
const filteredUsers = users.filter((user)=> user.name.toLowerCase().includes(search.toLowerCase()))

// Pagination
const indexOfLastUser = currentPage * usersPerPage;
const indexOfFirstUser = indexOfLastUser - usersPerPage;
const currentUsers = filteredUsers.slice(
  indexOfFirstUser,
  indexOfLastUser
);

  const roles = [
    { value: "student", label: "Student", color: "bg-purple-100 text-purple-800" },
    { value: "teacher", label: "Teacher", color: "bg-blue-100 text-blue-800" },
    { value: "parent", label: "Parent", color: "bg-orange-100 text-orange-800" },
    { value: "admin", label: "Admin", color: "bg-green-100 text-green-800" },
  ];

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // API call to create user
      // const response = await createUserAPI(formData);
      toast.success(`User ${formData.email} created successfully!`);
      setShowModal(false);
      setFormData({ name: "", email: "", role: "student", password: "" });
    } catch (error) {
      toast.error("Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm lg:text-base text-gray-600">Create and manage system users</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition w-full sm:w-auto"
        >
          <FaUserPlus />
          <span className="hidden xs:inline">Add New User</span>
          <span className="xs:hidden">Add User</span>
        </button>
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
                  placeholder="Search users..."
                  onChange={(e)=> setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm lg:text-base"
                />
              </div>
              
              {/* Desktop Filters */}
              <div className="hidden sm:flex items-center gap-2">
                <select className="px-3 lg:px-4 py-2 border rounded-lg text-sm lg:text-base">
                  <option>All Roles</option>
                  <option>Student</option>
                  <option>Teacher</option>
                  <option>Parent</option>
                  <option>Admin</option>
                </select>
                <button 
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
                >
                  {showMobileFilters ? <FaTimes /> : <FaBars />}
                  <span>Filters</span>
                </button>
              </div>
            </div>
            
            {/* Filter Button for Desktop */}
            <div className="hidden lg:flex items-center gap-2 text-gray-600 cursor-pointer hover:text-gray-800">
              <FaFilter />
              <span>Filter</span>
            </div>
          </div>
          
          {/* Mobile Filters Dropdown */}
          {showMobileFilters && (
            <div className="mt-3 sm:hidden p-3 bg-gray-50 rounded-lg">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option>All Roles</option>
                    <option>Student</option>
                    <option>Teacher</option>
                    <option>Parent</option>
                    <option>Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Suspended</option>
                  </select>
                </div>
              </div>
            </div>
          )}
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
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
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
                  <td className="px-3 lg:px-6 py-3 lg:py-4">
                    <div className="flex items-center space-x-1 lg:space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-800 p-1 lg:p-0"
                        aria-label="Edit user"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-800 p-1 lg:p-0"
                        aria-label="Delete user"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                      <button 
                        className="lg:hidden text-gray-600 hover:text-gray-800 p-1"
                        aria-label="More options"
                      >
                        <FaEllipsisV className="w-4 h-4" />
                      </button>
                    </div>
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
                  <p className="text-sm text-gray-600 mt-1 truncate">{user.email}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {user.status}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-2">
                  <button className="text-blue-600 p-1">
                    <FaEdit className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 p-1">
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 lg:mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of <span className="font-medium">{users.length}</span> users
        </div>
        <div className="flex items-center justify-center gap-2 mt-6">
  <button
    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
    disabled={currentPage === 1}
    className="px-3 py-1 border rounded disabled:opacity-50"
  >
    Prev
  </button>

  {Array.from(
    { length: Math.ceil(users.length / usersPerPage) },
    (_, i) => i + 1
  ).map(number => (
    <button
      key={number}
      onClick={() => setCurrentPage(number)}
      className={`px-3 py-1 border rounded ${
        currentPage === number
          ? "bg-black text-white"
          : "bg-white"
      }`}
    >
      {number}
    </button>
  ))}

  <button
    onClick={() =>
      setCurrentPage(prev =>
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

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 lg:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg lg:text-xl font-bold">Create New User</h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-500 hover:text-gray-700 text-xl"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm lg:text-base"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm lg:text-base"
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <div className="relative">
                  <FaUserTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg appearance-none text-sm lg:text-base bg-white"
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temporary Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm lg:text-base"
                  placeholder="Set temporary password"
                />
                <p className="text-xs text-gray-500 mt-1">
                  User will be asked to change password on first login
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm lg:text-base order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 text-sm lg:text-base order-1 sm:order-2"
                >
                  {loading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddUsers;