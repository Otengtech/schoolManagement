// pages/admin/UserManagement.jsx
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { 
  FaUserPlus, 
  FaEdit, 
  FaTrash, 
  FaEnvelope, 
  FaUserTag,
  FaSearch,
  FaFilter
} from "react-icons/fa";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    password: "",
  });

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600">Create and manage system users</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <FaUserPlus />
          Add New User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 border rounded-lg w-64"
              />
            </div>
            <select className="px-4 py-2 border rounded-lg">
              <option>All Roles</option>
              <option>Student</option>
              <option>Teacher</option>
              <option>Parent</option>
              <option>Admin</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <FaFilter />
            <span>Filter</span>
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* Sample data */}
            <tr>
              <td className="px-6 py-4">John Doe</td>
              <td className="px-6 py-4">john@example.com</td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Teacher
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </td>
              <td className="px-6 py-4">
                <button className="text-blue-600 hover:text-blue-800 mr-3">
                  <FaEdit />
                </button>
                <button className="text-red-600 hover:text-red-800">
                  <FaTrash />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New User</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
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
                  className="w-full px-3 py-2 border rounded-lg"
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
                    className="w-full pl-10 pr-3 py-2 border rounded-lg"
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
                    className="w-full pl-10 pr-3 py-2 border rounded-lg appearance-none"
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
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Set temporary password"
                />
                <p className="text-xs text-gray-500 mt-1">
                  User will be asked to change password on first login
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400"
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

export default UserManagement;