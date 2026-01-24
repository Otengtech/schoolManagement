import React, { useEffect, useMemo, useState } from "react";
import {
  FaSearch,
  FaUser,
  FaEye,
  FaEdit,
  FaTrash,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaExclamationTriangle,
  FaPhone,
  FaEnvelope,
  FaUserCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaFilter,
  FaSync,
  FaIdCard,
  FaCalendar,
  FaSchool,
  FaTimes,
  FaImage,
  FaCheck,
  FaBuilding
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../../../services/api";

/* ================= MAIN COMPONENT ================= */
const Parent = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [sortConfig, setSortConfig] = useState({
    key: "firstName",
    direction: "asc",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedParent, setSelectedParent] = useState(null);
  const [modalState, setModalState] = useState({
    view: false,
    edit: false,
    delete: false,
  });

  const [editForm, setEditForm] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  /* ================= FETCH ================= */
  const fetchParents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await api.get("/parent", {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Parents API Response:", res.data);
      setParents(res.data.parents || res.data.data || res.data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.message || "Failed to fetch parents");
      toast.error(err.response?.data?.message || "Failed to load parents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  /* ================= SORT ================= */
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  /* ================= FILTER + SEARCH ================= */
  const processedParents = useMemo(() => {
    let result = [...parents];

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((p) => {
        const fullName = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
        return (
          fullName.includes(term) ||
          p.email?.toLowerCase().includes(term) ||
          p.phone?.toLowerCase().includes(term)
        );
      });
    }

    // Status filter
    if (filterStatus !== "all") {
      result = result.filter((p) =>
        filterStatus === "active" ? p.isActive : !p.isActive
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal, bVal;

      if (sortConfig.key === "name") {
        aVal = `${a.firstName} ${a.lastName}`.toLowerCase();
        bVal = `${b.firstName} ${b.lastName}`.toLowerCase();
      } else {
        aVal = a[sortConfig.key];
        bVal = b[sortConfig.key];
      }

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (aVal < bVal) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    return result;
  }, [parents, searchTerm, filterStatus, sortConfig]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(processedParents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedParents = processedParents.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  /* ================= UPDATE PARENT ================= */
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUploadingPhoto(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Append parent fields
      const parentData = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phone: editForm.phone,
        isActive: editForm.isActive,
        role: "parent"
      };

      // If there's a new photo file
      if (editForm.profileImage instanceof File) {
        formData.append("profileImage", editForm.profileImage);
        formData.append("data", JSON.stringify(parentData));
        
        const response = await api.put(`/parent/${selectedParent._id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
        
        console.log("Update with photo response:", response.data);
      } else {
        // Send as JSON without photo
        const response = await api.put(`/parent/${selectedParent._id}`, parentData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        console.log("Update response:", response.data);
      }
      
      toast.success("Parent updated successfully");
      setModalState({ ...modalState, edit: false });
      setPhotoPreview(null);
      fetchParents();

    } catch (err) {
      console.error("Update error:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUploadingPhoto(false);
    }
  };

  /* ================= DELETE PARENT ================= */
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/parent/${selectedParent._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Parent deleted successfully");
      setModalState({ ...modalState, delete: false });
      fetchParents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  /* ================= HANDLERS ================= */
  const handleEditChange = (e) => {
    const { name, value, type, files } = e.target;
    
    console.log(`Edit change: ${name} = ${value}, type = ${type}`);
    
    if (type === 'file' && files && files[0]) {
      const file = files[0];
      console.log("File selected:", file.name, file.size, file.type);
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file (JPG, PNG, GIF)");
        return;
      }
      
      setEditForm(prev => ({ ...prev, profileImage: file }));
      setPhotoPreview(URL.createObjectURL(file));
      return;
    }
    
    if (name === "isActive") {
      setEditForm(prev => ({ ...prev, [name]: value === "true" || value === true }));
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const openEditModal = (parent) => {
    console.log("Opening edit modal for:", parent);
    setSelectedParent(parent);
    
    setEditForm({
      firstName: parent.firstName || "",
      lastName: parent.lastName || "",
      email: parent.email || "",
      phone: parent.phone || "",
      profileImage: parent.profileImage || null,
      isActive: parent.isActive !== undefined ? parent.isActive : true
    });
    
    setPhotoPreview(parent.profileImage || null);
    setModalState({ ...modalState, edit: true });
  };

  const openViewModal = (parent) => {
    setSelectedParent(parent);
    setModalState({ ...modalState, view: true });
  };

  /* ================= FORMATTERS ================= */
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (err) {
      return "Invalid Date";
    }
  };

  if (loading) return <Loading message="Loading parents..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              <FaUserCircle className="inline mr-3 text-blue-600" />
              Parents Management
            </h1>
            <p className="text-gray-600 mt-2">
              <span className="font-medium">{parents.length}</span> total parents • 
              <span className="font-medium text-green-600 ml-2">{processedParents.length}</span> filtered
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchParents}
              className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <FaSync className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* SEARCH & FILTER */}
        <div className="bg-white p-5 rounded-xl shadow-lg mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative flex items-center justify-center ">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={sortConfig.key}
                onChange={(e) => handleSort(e.target.value)}
              >
                <option value="firstName">Name</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="createdAt">Date Created</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-[#052954] to-blue-800">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[80px]">
                  Avatar
                </th>

                <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[200px]">
                  <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("firstName")}>
                    Parent Name
                    {sortConfig.key === "firstName" && (
                      sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />
                    )}
                  </div>
                </th>

                <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[200px]">
                  <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("email")}>
                    <FaEnvelope className="text-sm" />
                    Email
                    {sortConfig.key === "email" && (
                      sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />
                    )}
                  </div>
                </th>

                <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[150px]">
                  <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("phone")}>
                    <FaPhone className="text-sm" />
                    Phone
                    {sortConfig.key === "phone" && (
                      sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />
                    )}
                  </div>
                </th>

                <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[120px]">
                  <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("isActive")}>
                    Status
                    {sortConfig.key === "isActive" && (
                      sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />
                    )}
                  </div>
                </th>

                <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[150px]">
                  <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("createdAt")}>
                    <FaCalendar className="text-sm" />
                    Created
                    {sortConfig.key === "createdAt" && (
                      sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />
                    )}
                  </div>
                </th>

                <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[120px]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedParents.length > 0 ? (
                paginatedParents.map((p) => (
                  <tr key={p._id} className="hover:bg-blue-50/50 transition-colors">
                    {/* AVATAR */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex-shrink-0 w-12 h-12 mx-auto">
                        {p.profileImage ? (
                          <img 
                            src={p.profileImage} 
                            alt={`${p.firstName} ${p.lastName}`}
                            className="w-12 h-12 rounded-full object-cover border-2 border-blue-100 shadow-sm"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `
                                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-50 flex items-center justify-center">
                                  <FaUser class="text-blue-400 text-xl" />
                                </div>
                              `;
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-50 flex items-center justify-center">
                            <FaUser className="text-blue-400 text-xl" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* NAME */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">
                        {p.firstName} {p.lastName}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <FaIdCard className="inline mr-1" />
                        ID: {p._id?.substring(0, 8)}...
                      </div>
                    </td>

                    {/* EMAIL */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-gray-400" />
                        <span className="text-sm text-gray-900 truncate">{p.email}</span>
                      </div>
                    </td>

                    {/* PHONE */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-gray-400" />
                        <span className="text-sm text-gray-900">{p.phone || "N/A"}</span>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                        p.isActive 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {p.isActive ? (
                          <>
                            <FaCheckCircle className="mr-1.5" />
                            Active
                          </>
                        ) : (
                          <>
                            <FaTimesCircle className="mr-1.5" />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>

                    {/* CREATED */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(p.createdAt)}
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openViewModal(p)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-100"
                          title="Edit Parent"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedParent(p);
                            setModalState({ ...modalState, delete: true });
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                          title="Delete Parent"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-16 text-center">
                    <div className="text-gray-300 mb-4">
                      <FaUserCircle className="text-6xl mx-auto" />
                    </div>
                    <p className="text-gray-500 font-medium text-lg mb-2">No parents found</p>
                    <p className="text-gray-400 text-sm max-w-md mx-auto">
                      {searchTerm || filterStatus !== "all"
                        ? "No parents match your search criteria. Try adjusting filters." 
                        : "No parents have been registered yet."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
        <div>
          Showing <span className="font-semibold text-gray-700">
            {Math.min(startIndex + 1, processedParents.length)}-
            {Math.min(startIndex + itemsPerPage, processedParents.length)}
          </span> of{" "}
          <span className="font-semibold text-gray-700">{processedParents.length}</span> parents
        </div>
        
        <div className="flex gap-2 mt-2 sm:mt-0">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === pageNum
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* VIEW PARENT MODAL */}
      {modalState.view && selectedParent && (
        <Modal onClose={() => setModalState({ ...modalState, view: false })}>
          <div className="space-y-8">
            {/* HEADER WITH PHOTO */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-40 h-40 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 border-4 border-white shadow-xl">
                {selectedParent.profileImage ? (
                  <img 
                    src={selectedParent.profileImage} 
                    alt={selectedParent.firstName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaUser className="text-blue-400 text-5xl" />
                  </div>
                )}
              </div>
              <div className="text-center md:text-left flex-1">
                <h3 className="text-3xl font-bold text-gray-900">
                  {selectedParent.firstName} {selectedParent.lastName}
                </h3>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    Parent
                  </span>
                  <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${
                    selectedParent.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedParent.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-600 mt-4">
                  <FaEnvelope className="inline mr-2" />
                  {selectedParent.email}
                </p>
              </div>
            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem 
                icon={<FaUser />} 
                label="First Name" 
                value={selectedParent.firstName} 
              />
              <DetailItem 
                icon={<FaUser />} 
                label="Last Name" 
                value={selectedParent.lastName} 
              />
              <DetailItem 
                icon={<FaEnvelope />} 
                label="Email" 
                value={selectedParent.email} 
              />
              <DetailItem 
                icon={<FaPhone />} 
                label="Phone" 
                value={selectedParent.phone || "Not provided"} 
              />
              <DetailItem 
                icon={<FaCheckCircle />} 
                label="Account Status" 
                value={
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedParent.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedParent.isActive ? 'Active Account' : 'Inactive Account'}
                  </span>
                } 
              />
              <DetailItem 
                icon={<FaSchool />} 
                label="Role" 
                value={selectedParent.role || "Parent"} 
              />
              <DetailItem 
                icon={<FaCalendar />} 
                label="Created Date" 
                value={formatDate(selectedParent.createdAt)} 
              />
              <DetailItem 
                icon={<FaCalendar />} 
                label="Last Updated" 
                value={formatDate(selectedParent.updatedAt)} 
              />
              
              {/* SYSTEM INFO */}
              <div className="md:col-span-2">
                <h4 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">System Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailItem 
                    label="Database ID" 
                    value={<code className="text-xs bg-gray-100 p-1 rounded">{selectedParent._id}</code>} 
                  />
                  <DetailItem 
                    label="School ID" 
                    value={selectedParent.school || "Not assigned"} 
                  />
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT PARENT MODAL */}
      {modalState.edit && (
        <Modal 
          onClose={() => {
            setModalState({ ...modalState, edit: false });
            setPhotoPreview(null);
          }}
          title="Edit Parent Information"
        >
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PERSONAL INFO */}
              <div className="md:col-span-2">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Personal Information</h4>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline mr-2 text-gray-400" />
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={editForm.firstName}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline mr-2 text-gray-400" />
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={editForm.lastName}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline mr-2 text-gray-400" />
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaPhone className="inline mr-2 text-gray-400" />
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCheck className="inline mr-2 text-gray-400" />
                  Status *
                </label>
                <select
                  name="isActive"
                  value={editForm.isActive}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              {/* PHOTO UPLOAD */}
              <div className="md:col-span-2">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Profile Photo</h4>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-40 h-40 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 border-4 border-white shadow-lg">
                    {photoPreview ? (
                      <img 
                        src={photoPreview} 
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : editForm.profileImage && typeof editForm.profileImage === "string" ? (
                      <img 
                        src={editForm.profileImage} 
                        alt="Current"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaUser className="text-blue-400 text-4xl" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all shadow-md mb-3">
                      <FaImage />
                      {photoPreview ? "Change Photo" : "Upload Photo"}
                      <input
                        type="file"
                        name="profileImage"
                        accept="image/*"
                        onChange={handleEditChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-gray-500 text-sm">
                      JPG, PNG, or GIF. Maximum file size: 5MB.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={uploadingPhoto}
                className="flex-1 py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {uploadingPhoto ? (
                  <>
                    <FaSync className="animate-spin inline mr-2" />
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalState({ ...modalState, edit: false });
                  setPhotoPreview(null);
                }}
                className="px-8 py-3.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {modalState.delete && selectedParent && (
        <Modal 
          onClose={() => setModalState({ ...modalState, delete: false })}
          title="Confirm Deletion"
        >
          <div className="text-center py-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 to-pink-100 border-4 border-red-50 flex items-center justify-center">
              <FaTrash className="text-red-500 text-4xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Delete Parent?
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You are about to permanently delete{" "}
              <span className="font-bold text-red-600">
                {selectedParent.firstName} {selectedParent.lastName}
              </span>
              {" "}({selectedParent.email}). This action cannot be undone.
            </p>
            
            <div className="bg-red-50 border border-red-100 rounded-xl p-6 mb-8">
              <h4 className="font-semibold text-red-800 mb-3">⚠️ This will delete:</h4>
              <ul className="text-left text-red-700 space-y-2">
                <li className="flex items-center gap-2">
                  <FaTimesCircle className="text-red-500" />
                  Parent profile and all personal data
                </li>
                <li className="flex items-center gap-2">
                  <FaTimesCircle className="text-red-500" />
                  All associated student records
                </li>
                <li className="flex items-center gap-2">
                  <FaTimesCircle className="text-red-500" />
                  Communication history
                </li>
                <li className="flex items-center gap-2">
                  <FaTimesCircle className="text-red-500" />
                  All associated files and documents
                </li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleDelete}
                className="flex-1 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
              >
                Yes, Delete Permanently
              </button>
              <button
                onClick={() => setModalState({ ...modalState, delete: false })}
                className="flex-1 py-3.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

/* ================= REUSABLE COMPONENTS ================= */

const Modal = ({ children, onClose, title }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
    <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        {title && <h2 className="text-2xl font-bold text-gray-900">{title}</h2>}
        <button
          onClick={onClose}
          className="p-3 hover:bg-gray-100 rounded-full transition-colors"
          title="Close"
        >
          <FaTimes className="text-gray-500 text-xl" />
        </button>
      </div>
      <div className="p-8">{children}</div>
    </div>
  </div>
);

const DetailItem = ({ icon, label, value }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3 mb-2">
      {icon && <div className="text-blue-500">{icon}</div>}
      <div className="text-sm font-medium text-gray-500">{label}</div>
    </div>
    <div className="text-lg font-semibold text-gray-900 break-words">
      {value || "Not specified"}
    </div>
  </div>
);

const Loading = ({ message }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
    <p className="text-gray-600 text-lg">{message}</p>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="bg-red-50 p-8 rounded-xl text-center max-w-md">
      <FaExclamationTriangle className="text-red-600 text-5xl mx-auto mb-4" />
      <h3 className="text-xl font-bold text-red-800 mb-2">Error Loading Parents</h3>
      <p className="text-red-600">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Retry
      </button>
    </div>
  </div>
);

export default Parent;