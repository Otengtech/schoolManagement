// ===== IMPORTS =====
import React, { useEffect, useState, useMemo } from "react";
import {
  FaUserGraduate, FaSearch, FaEye, FaEdit, FaTrash, FaPhone,
  FaCalendar, FaSchool, FaEnvelope, FaMars, FaVenus, FaGenderless,
  FaImage, FaUserFriends, FaIdCard, FaTimes, FaCheck, FaTimesCircle,
  FaFilter, FaSync, FaCaretDown, FaCaretUp, FaBirthdayCake,
  FaGraduationCap, FaBuilding, FaUser, FaMobile, FaKey
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../../../services/api";

// ================= MAIN COMPONENT =================
const Students = () => {
  // ================= STATES =================
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ 
    level: "all", 
    gender: "all", 
    admissionTerm: "all", 
    status: "all",
    className: "all"
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalState, setModalState] = useState({ 
    view: false, 
    edit: false, 
    delete: false 
  });
  const [editForm, setEditForm] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // ================= FETCH STUDENTS =================
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await api.get("/students", {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("API Response:", res.data);

      const clean = (res.data.data || []).map(s => ({
        _id: s._id,
        school: s.school || "",
        firstName: s.firstName || "",
        lastName: s.lastName || "",
        gender: s.gender || "",
        dateOfBirth: s.dateOfBirth || "",
        age: s.age || 0,
        studentPhoto: s.studentPhoto || null,
        studentId: s.studentId || "",
        admissionYear: s.admissionYear || "",
        admissionTerm: s.admissionTerm || "",
        level: s.level || "",
        className: s.className || "",
        parent: s.parent || {},
        isActive: s.isActive !== undefined ? s.isActive : true,
        createdAt: s.createdAt || "",
        updatedAt: s.updatedAt || "",
        __v: s.__v || 0
      }));

      setStudents(clean);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error(err.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchStudents(); 
  }, []);

  // ================= SORTING =================
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // ================= FILTER STUDENTS =================
  const filteredStudents = useMemo(() => {
    let r = [...students];

    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      r = r.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(t) ||
        s.studentId?.toLowerCase().includes(t) ||
        `${s.parent?.firstName || ""} ${s.parent?.lastName || ""}`.toLowerCase().includes(t) ||
        s.parent?.email?.toLowerCase().includes(t) ||
        s.className?.toLowerCase().includes(t)
      );
    }

    if (filters.level !== "all") r = r.filter(s => s.level === filters.level);
    if (filters.gender !== "all") r = r.filter(s => s.gender === filters.gender);
    if (filters.admissionTerm !== "all") r = r.filter(s => s.admissionTerm === filters.admissionTerm);
    if (filters.status !== "all") r = r.filter(s => filters.status === "active" ? s.isActive : !s.isActive);
    if (filters.className !== "all") r = r.filter(s => s.className === filters.className);

    return r;
  }, [students, searchTerm, filters]);

  const sortedStudents = useMemo(() => {
    if (!sortConfig.key) return filteredStudents;
    
    return [...filteredStudents].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (sortConfig.key.includes('.')) {
        const keys = sortConfig.key.split('.');
        aVal = keys.reduce((obj, key) => obj?.[key], a);
        bVal = keys.reduce((obj, key) => obj?.[key], b);
      }
      
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      
      if (aVal < bVal) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredStudents, sortConfig]);

  // ================= IMPROVED EDIT CHANGE HANDLER =================
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
      
      setEditForm(prev => ({ ...prev, studentPhoto: file }));
      setPhotoPreview(URL.createObjectURL(file));
      return;
    }
    
    if (name === "level") {
      setEditForm(prev => ({ 
        ...prev, 
        [name]: value,
        className: "" 
      }));
    } else if (name === "isActive") {
      setEditForm(prev => ({ ...prev, [name]: value === "true" || value === true }));
    } else if (name === "age") {
      const ageNum = parseInt(value) || 0;
      setEditForm(prev => ({ ...prev, [name]: ageNum }));
    } else if (name === "dateOfBirth") {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setEditForm(prev => ({ ...prev, [name]: date.toISOString().split('T')[0] }));
      } else {
        setEditForm(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // ================= FIXED UPDATE STUDENT =================
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUploadingPhoto(true);

    try {
      const token = localStorage.getItem("token");
      
      // Create FormData for potential file upload
      const formData = new FormData();
      
      // Append student fields
      const studentData = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        gender: editForm.gender,
        dateOfBirth: editForm.dateOfBirth,
        age: Number(editForm.age),
        studentId: editForm.studentId,
        admissionYear: editForm.admissionYear,
        admissionTerm: editForm.admissionTerm,
        level: editForm.level,
        className: editForm.className,
        isActive: editForm.isActive,
        parent: {
          firstName: editForm.parentFirstName || "",
          lastName: editForm.parentLastName || "",
          email: editForm.parentEmail || "",
          phone: editForm.parentPhone || ""
        }
      };
      
      // If there's a new photo file
      if (editForm.studentPhoto instanceof File) {
        formData.append("studentPhoto", editForm.studentPhoto);
        formData.append("data", JSON.stringify(studentData));
        
        // Send as multipart/form-data
        const response = await api.put(`/students/${selectedStudent._id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
        
        console.log("Update with photo response:", response.data);
      } else {
        // Send as JSON without photo
        const response = await api.put(`/students/${selectedStudent._id}`, studentData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        console.log("Update response:", response.data);
      }
      
      toast.success("Student updated successfully");
      setModalState({ ...modalState, edit: false });
      setPhotoPreview(null);
      fetchStudents();

    } catch (err) {
      console.error("Update error:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.error || 
                      err.message || 
                      "Update failed. Please check your data.";
      
      toast.error(`❌ ${errorMsg}`);
      
      if (err.response?.data?.errors) {
        console.log("Validation errors:", err.response.data.errors);
        Object.values(err.response.data.errors).forEach(error => {
          toast.error(`Validation: ${error}`);
        });
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ================= DELETE STUDENT =================
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/students/${selectedStudent._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Student deleted successfully");
      setModalState({ ...modalState, delete: false });
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  // ================= HANDLERS =================
  const openEditModal = (student) => {
    console.log("Opening edit modal for:", student);
    setSelectedStudent(student);
    
    let formattedDate = "";
    if (student.dateOfBirth) {
      try {
        const date = new Date(student.dateOfBirth);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split('T')[0];
        }
      } catch (e) {
        console.error("Date formatting error:", e);
      }
    }
    
    setEditForm({
      firstName: student.firstName || "",
      lastName: student.lastName || "",
      gender: student.gender || "",
      dateOfBirth: formattedDate,
      age: student.age || "",
      studentId: student.studentId || "",
      admissionYear: student.admissionYear || "",
      admissionTerm: student.admissionTerm || "",
      level: student.level || "",
      className: student.className || "",
      parentFirstName: student.parent?.firstName || "",
      parentLastName: student.parent?.lastName || "",
      parentEmail: student.parent?.email || "",
      parentPhone: student.parent?.phone || "",
      studentPhoto: student.studentPhoto || null,
      isActive: student.isActive !== undefined ? student.isActive : true
    });
    
    setPhotoPreview(student.studentPhoto || null);
    setModalState({ ...modalState, edit: true });
  };

  const openViewModal = (student) => {
    setSelectedStudent(student);
    setModalState({ ...modalState, view: true });
  };

  // ================= FORMATTERS =================
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

  const formatTerm = (term) => {
    switch(term) {
      case "term1": return "Term 1";
      case "term2": return "Term 2";
      case "term3": return "Term 3";
      default: return term || "N/A";
    }
  };

  const formatGender = (gender) => {
    if (!gender) return "N/A";
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  };

  // ================= OPTIONS =================
  const levels = ["all", ...new Set(students.map(s => s.level).filter(Boolean).sort())];
  const classes = ["all", ...new Set(students.map(s => s.className).filter(Boolean).sort())];
  const admissionTerms = ["all", "term1", "term2", "term3"];
  const genderOptions = ["all", "male", "female", "other"];
  const statusOptions = ["all", "active", "inactive"];
  
  const classOptions = {
    "JHS 1": ["JHS 1A", "JHS 1B", "JHS 1C", "JHS 1D"],
    "JHS 2": ["JHS 2A", "JHS 2B", "JHS 2C", "JHS 2D"],
    "JHS 3": ["JHS 3A", "JHS 3B", "JHS 3C", "JHS 3D"],
    "SHS 1": ["SHS 1A", "SHS 1B", "SHS 1C", "SHS 1D"],
    "SHS 2": ["SHS 2A", "SHS 2B", "SHS 2C", "SHS 2D"],
    "SHS 3": ["SHS 3A", "SHS 3B", "SHS 3C", "SHS 3D"],
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
        <p className="text-gray-600 text-lg">Loading students...</p>
      </div>
    );
  }

  // ================= MAIN RENDER =================
  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* HEADER SECTION */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              <FaUserGraduate className="inline mr-3 text-blue-600" />
              Student Management
            </h1>
            <p className="text-gray-600 mt-2">
              <span className="font-medium">{students.length}</span> total students • 
              <span className="font-medium text-green-600 ml-2">{filteredStudents.length}</span> filtered
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchStudents}
              className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <FaSync className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <FaFilter />
              <span className="hidden sm:inline">Filters</span>
              <span className={`ml-1 px-2 py-1 text-xs rounded-full ${showFilters ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                {Object.values(filters).filter(f => f !== "all").length}
              </span>
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative mb-4">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search students by name, ID, class, or parent..."
            className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* FILTERS PANEL */}
        {showFilters && (
          <div className="bg-white p-5 rounded-xl shadow-lg mb-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaFilter className="text-blue-500" />
              Filter Students
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={filters.level}
                  onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                >
                  <option value="all">All Levels</option>
                  {levels.slice(1).map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={filters.className}
                  onChange={(e) => setFilters({ ...filters, className: e.target.value })}
                >
                  <option value="all">All Classes</option>
                  {classes.slice(1).map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={filters.gender}
                  onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                >
                  {genderOptions.map(gender => (
                    <option key={gender} value={gender}>
                      {gender === "all" ? "All Gender" : gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admission Term</label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={filters.admissionTerm}
                  onChange={(e) => setFilters({ ...filters, admissionTerm: e.target.value })}
                >
                  <option value="all">All Terms</option>
                  {admissionTerms.slice(1).map(term => (
                    <option key={term} value={term}>{formatTerm(term)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status === "all" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MAIN TABLE - RESPONSIVE WITH HORIZONTAL SCROLL */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-[#052954] to-blue-800">
              <tr>
                {/* PHOTO */}
                <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[80px]">
                  <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('studentPhoto')}>
                    Photo
                    {sortConfig.key === 'studentPhoto' && (
                      sortConfig.direction === 'asc' ? <FaCaretUp /> : <FaCaretDown />
                    )}
                  </div>
                </th>

                {/* NAME & DETAILS */}
                <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[180px]">
                  <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('firstName')}>
                    Student Details
                    {sortConfig.key === 'firstName' && (
                      sortConfig.direction === 'asc' ? <FaCaretUp /> : <FaCaretDown />
                    )}
                  </div>
                </th>

                {/* STUDENT ID */}
                <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[140px]">
                  <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('studentId')}>
                    <FaIdCard className="text-sm" />
                    Student ID
                    {sortConfig.key === 'studentId' && (
                      sortConfig.direction === 'asc' ? <FaCaretUp /> : <FaCaretDown />
                    )}
                  </div>
                </th>

                {/* GENDER & AGE */}
                <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[100px]">
                  <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('gender')}>
                    Gender/Age
                    {sortConfig.key === 'gender' && (
                      sortConfig.direction === 'asc' ? <FaCaretUp /> : <FaCaretDown />
                    )}
                  </div>
                </th>

                {/* ACADEMIC INFO */}
                <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[150px]">
                  <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('level')}>
                    <FaSchool className="text-sm" />
                    Class
                    {sortConfig.key === 'level' && (
                      sortConfig.direction === 'asc' ? <FaCaretUp /> : <FaCaretDown />
                    )}
                  </div>
                </th>

                {/* ADMISSION */}
                <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[140px]">
                  <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('admissionYear')}>
                    <FaCalendar className="text-sm" />
                    Admission
                    {sortConfig.key === 'admissionYear' && (
                      sortConfig.direction === 'asc' ? <FaCaretUp /> : <FaCaretDown />
                    )}
                  </div>
                </th>

                {/* PARENT INFO */}
                <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[200px]">
                  <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('parent.firstName')}>
                    <FaUserFriends className="text-sm" />
                    Parent Info
                    {sortConfig.key === 'parent.firstName' && (
                      sortConfig.direction === 'asc' ? <FaCaretUp /> : <FaCaretDown />
                    )}
                  </div>
                </th>

                {/* PARENT CONTACT */}
                <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[180px]">
                  <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('parent.email')}>
                    <FaEnvelope className="text-sm" />
                    Parent Contact
                    {sortConfig.key === 'parent.email' && (
                      sortConfig.direction === 'asc' ? <FaCaretUp /> : <FaCaretDown />
                    )}
                  </div>
                </th>

                {/* STATUS */}
                <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[100px]">
                  <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('isActive')}>
                    Status
                    {sortConfig.key === 'isActive' && (
                      sortConfig.direction === 'asc' ? <FaCaretUp /> : <FaCaretDown />
                    )}
                  </div>
                </th>

                {/* ACTIONS */}
                <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[120px]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {sortedStudents.length > 0 ? (
                sortedStudents.map((s) => (
                  <tr key={s._id} className="hover:bg-blue-50/50 transition-colors">
                    {/* PHOTO */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex-shrink-0 w-12 h-12 mx-auto">
                        {s.studentPhoto ? (
                          <img 
                            src={s.studentPhoto} 
                            alt={`${s.firstName} ${s.lastName}`}
                            className="w-12 h-12 rounded-full object-cover border-2 border-blue-100 shadow-sm"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `
                                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-50 flex items-center justify-center">
                                  <FaUserGraduate class="text-blue-400 text-xl" />
                                </div>
                              `;
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-50 flex items-center justify-center">
                            <FaUserGraduate className="text-blue-400 text-xl" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* NAME & DETAILS */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">
                        {s.firstName} {s.lastName}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <FaBirthdayCake className="inline mr-1" />
                        {formatDate(s.dateOfBirth)}
                      </div>
                    </td>

                    {/* STUDENT ID */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-mono text-sm bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                        {s.studentId}
                      </div>
                    </td>

                    {/* GENDER & AGE */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          s.gender === 'male' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          s.gender === 'female' ? 'bg-pink-100 text-pink-800 border border-pink-200' :
                          'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {s.gender === 'male' ? <FaMars className="mr-1" /> : 
                           s.gender === 'female' ? <FaVenus className="mr-1" /> : 
                           <FaGenderless className="mr-1" />}
                          {formatGender(s.gender)}
                        </span>
                        <div className="text-sm text-gray-600">
                          Age: <span className="font-medium">{s.age}</span>
                        </div>
                      </div>
                    </td>

                    {/* ACADEMIC INFO */}
                    <td className="px-4 py-3">
                      <div className="space-y-1.5">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-100">
                          {s.level}
                        </span>
                        <div className="text-sm font-medium text-gray-900">
                          {s.className}
                        </div>
                      </div>
                    </td>

                    {/* ADMISSION */}
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {s.admissionYear}
                        </div>
                        <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border">
                          {formatTerm(s.admissionTerm)}
                        </div>
                      </div>
                    </td>

                    {/* PARENT INFO */}
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900 text-sm">
                          {s.parent?.firstName || 'No'} {s.parent?.lastName || 'Parent'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Parent/Guardian
                        </div>
                      </div>
                    </td>

                    {/* PARENT CONTACT */}
                    <td className="px-4 py-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1 text-sm text-gray-900 truncate max-w-[160px]">
                          <FaEnvelope className="text-gray-400 text-xs flex-shrink-0" />
                          <span className="truncate">{s.parent?.email || 'No email'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <FaPhone className="text-gray-400 text-xs flex-shrink-0" />
                          {s.parent?.phone || 'No phone'}
                        </div>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                        s.isActive 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {s.isActive ? (
                          <>
                            <FaCheck className="mr-1.5" />
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

                    {/* ACTIONS */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openViewModal(s)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-100"
                          title="Edit Student"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(s);
                            setModalState({ ...modalState, delete: true });
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                          title="Delete Student"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="px-4 py-16 text-center">
                    <div className="text-gray-300 mb-4">
                      <FaUserGraduate className="text-6xl mx-auto" />
                    </div>
                    <p className="text-gray-500 font-medium text-lg mb-2">No students found</p>
                    <p className="text-gray-400 text-sm max-w-md mx-auto">
                      {searchTerm || Object.values(filters).some(f => f !== "all")
                        ? "No students match your search criteria. Try adjusting filters." 
                        : "No students have been registered yet. Add your first student!"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER INFO */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
        <div>
          Showing <span className="font-semibold text-gray-700">{filteredStudents.length}</span> of{" "}
          <span className="font-semibold text-gray-700">{students.length}</span> students
        </div>
        <div className="mt-2 sm:mt-0">
          {sortedStudents.length > 0 && (
            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
              Sorted by: {sortConfig.key ? `${sortConfig.key} (${sortConfig.direction})` : 'None'}
            </span>
          )}
        </div>
      </div>

      {/* VIEW STUDENT MODAL */}
      {modalState.view && selectedStudent && (
        <Modal onClose={() => setModalState({ ...modalState, view: false })}>
          <div className="space-y-8">
            {/* HEADER WITH PHOTO */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-40 h-40 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 border-4 border-white shadow-xl">
                {selectedStudent.studentPhoto ? (
                  <img 
                    src={selectedStudent.studentPhoto} 
                    alt={selectedStudent.firstName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaUserGraduate className="text-blue-400 text-5xl" />
                  </div>
                )}
              </div>
              <div className="text-center md:text-left flex-1">
                <h3 className="text-3xl font-bold text-gray-900">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </h3>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {selectedStudent.level}
                  </span>
                  <span className="px-3 py-1.5 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    {selectedStudent.className}
                  </span>
                  <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${
                    selectedStudent.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedStudent.isActive ? 'Active Student' : 'Inactive Student'}
                  </span>
                </div>
                <p className="text-gray-600 mt-4">
                  <FaIdCard className="inline mr-2" />
                  Student ID: <span className="font-mono font-semibold">{selectedStudent.studentId}</span>
                </p>
              </div>
            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem 
                icon={<FaUser />} 
                label="First Name" 
                value={selectedStudent.firstName} 
              />
              <DetailItem 
                icon={<FaUser />} 
                label="Last Name" 
                value={selectedStudent.lastName} 
              />
              <DetailItem 
                icon={selectedStudent.gender === 'male' ? <FaMars /> : <FaVenus />} 
                label="Gender" 
                value={formatGender(selectedStudent.gender)} 
              />
              <DetailItem 
                icon={<FaBirthdayCake />} 
                label="Age" 
                value={`${selectedStudent.age} years`} 
              />
              <DetailItem 
                icon={<FaCalendar />} 
                label="Date of Birth" 
                value={formatDate(selectedStudent.dateOfBirth)} 
              />
              <DetailItem 
                icon={<FaKey />} 
                label="Student ID" 
                value={selectedStudent.studentId} 
              />
              <DetailItem 
                icon={<FaGraduationCap />} 
                label="Level" 
                value={selectedStudent.level} 
              />
              <DetailItem 
                icon={<FaBuilding />} 
                label="Class" 
                value={selectedStudent.className} 
              />
              <DetailItem 
                icon={<FaCalendar />} 
                label="Admission Year" 
                value={selectedStudent.admissionYear} 
              />
              <DetailItem 
                icon={<FaCalendar />} 
                label="Admission Term" 
                value={formatTerm(selectedStudent.admissionTerm)} 
              />
              
              {/* PARENT SECTION */}
              <div className="md:col-span-2">
                <h4 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b flex items-center gap-2">
                  <FaUserFriends className="text-blue-500" />
                  Parent/Guardian Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                  <DetailItem 
                    icon={<FaUser />} 
                    label="Parent First Name" 
                    value={selectedStudent.parent?.firstName || "Not provided"} 
                  />
                  <DetailItem 
                    icon={<FaUser />} 
                    label="Parent Last Name" 
                    value={selectedStudent.parent?.lastName || "Not provided"} 
                  />
                  <DetailItem 
                    icon={<FaEnvelope />} 
                    label="Parent Email" 
                    value={selectedStudent.parent?.email || "Not provided"} 
                  />
                  <DetailItem 
                    icon={<FaPhone />} 
                    label="Parent Phone" 
                    value={selectedStudent.parent?.phone || "Not provided"} 
                  />
                </div>
              </div>

              {/* SYSTEM INFO */}
              <div className="md:col-span-2">
                <h4 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">System Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailItem 
                    label="Account Status" 
                    value={
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedStudent.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedStudent.isActive ? 'Active Account' : 'Inactive Account'}
                      </span>
                    } 
                  />
                  <DetailItem 
                    label="Created Date" 
                    value={formatDate(selectedStudent.createdAt)} 
                  />
                  <DetailItem 
                    label="Last Updated" 
                    value={formatDate(selectedStudent.updatedAt)} 
                  />
                  <DetailItem 
                    label="Database ID" 
                    value={<code className="text-xs bg-gray-100 p-1 rounded">{selectedStudent._id}</code>} 
                  />
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT STUDENT MODAL */}
      {modalState.edit && (
        <Modal 
          onClose={() => {
            setModalState({ ...modalState, edit: false });
            setPhotoPreview(null);
          }}
          title="Edit Student Information"
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
                  <FaMars className="inline mr-2 text-gray-400" />
                  Gender *
                </label>
                <select
                  name="gender"
                  value={editForm.gender}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaBirthdayCake className="inline mr-2 text-gray-400" />
                  Age *
                </label>
                <input
                  type="number"
                  name="age"
                  min="1"
                  max="100"
                  value={editForm.age}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendar className="inline mr-2 text-gray-400" />
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={editForm.dateOfBirth}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              {/* STUDENT INFO */}
              <div className="md:col-span-2 mt-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Student Information</h4>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaKey className="inline mr-2 text-gray-400" />
                  Student ID *
                </label>
                <input
                  type="text"
                  name="studentId"
                  value={editForm.studentId}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendar className="inline mr-2 text-gray-400" />
                  Admission Year *
                </label>
                <input
                  type="text"
                  name="admissionYear"
                  value={editForm.admissionYear}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendar className="inline mr-2 text-gray-400" />
                  Admission Term *
                </label>
                <select
                  name="admissionTerm"
                  value={editForm.admissionTerm}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Select Term</option>
                  <option value="term1">Term 1</option>
                  <option value="term2">Term 2</option>
                  <option value="term3">Term 3</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaGraduationCap className="inline mr-2 text-gray-400" />
                  Level *
                </label>
                <select
                  name="level"
                  value={editForm.level}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Select Level</option>
                  <option value="JHS 1">JHS 1</option>
                  <option value="JHS 2">JHS 2</option>
                  <option value="JHS 3">JHS 3</option>
                  <option value="SHS 1">SHS 1</option>
                  <option value="SHS 2">SHS 2</option>
                  <option value="SHS 3">SHS 3</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaBuilding className="inline mr-2 text-gray-400" />
                  Class *
                </label>
                <select
                  name="className"
                  value={editForm.className}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  required
                  disabled={!editForm.level}
                >
                  <option value="">Select Class</option>
                  {editForm.level && classOptions[editForm.level]?.map(className => (
                    <option key={className} value={className}>{className}</option>
                  ))}
                </select>
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

              {/* PARENT INFO */}
              <div className="md:col-span-2 mt-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Parent/Guardian Information</h4>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent First Name</label>
                <input
                  type="text"
                  name="parentFirstName"
                  value={editForm.parentFirstName}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Last Name</label>
                <input
                  type="text"
                  name="parentLastName"
                  value={editForm.parentLastName}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Email</label>
                <input
                  type="email"
                  name="parentEmail"
                  value={editForm.parentEmail}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Phone</label>
                <input
                  type="tel"
                  name="parentPhone"
                  value={editForm.parentPhone}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* PHOTO UPLOAD */}
              <div className="md:col-span-2">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Student Photo</h4>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-40 h-40 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 border-4 border-white shadow-lg">
                    {photoPreview ? (
                      <img 
                        src={photoPreview} 
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : editForm.studentPhoto && typeof editForm.studentPhoto === "string" ? (
                      <img 
                        src={editForm.studentPhoto} 
                        alt="Current"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaUserGraduate className="text-blue-400 text-4xl" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all shadow-md mb-3">
                      <FaImage />
                      {photoPreview ? "Change Photo" : "Upload Photo"}
                      <input
                        type="file"
                        name="studentPhoto"
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
      {modalState.delete && selectedStudent && (
        <Modal 
          onClose={() => setModalState({ ...modalState, delete: false })}
          title="Confirm Deletion"
        >
          <div className="text-center py-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 to-pink-100 border-4 border-red-50 flex items-center justify-center">
              <FaTrash className="text-red-500 text-4xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Delete Student?
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You are about to permanently delete{" "}
              <span className="font-bold text-red-600">
                {selectedStudent.firstName} {selectedStudent.lastName}
              </span>
              {" "}({selectedStudent.studentId}). This action cannot be undone.
            </p>
            
            <div className="bg-red-50 border border-red-100 rounded-xl p-6 mb-8">
              <h4 className="font-semibold text-red-800 mb-3">⚠️ This will delete:</h4>
              <ul className="text-left text-red-700 space-y-2">
                <li className="flex items-center gap-2">
                  <FaTimesCircle className="text-red-500" />
                  Student profile and all personal data
                </li>
                <li className="flex items-center gap-2">
                  <FaTimesCircle className="text-red-500" />
                  Academic records and progress reports
                </li>
                <li className="flex items-center gap-2">
                  <FaTimesCircle className="text-red-500" />
                  Attendance and performance history
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

// ================= REUSABLE COMPONENTS =================
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

export default Students;