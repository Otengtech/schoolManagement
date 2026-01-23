import React, { useEffect, useState, useMemo } from "react";
import {
  FaUserTie,
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaTrash,
  FaSort,
  FaTimes,
  FaPhone,
  FaCalendar,
  FaGraduationCap,
  FaBook,
  FaSchool,
  FaEnvelope,
  FaMars,
  FaVenus,
  FaGenderless,
  FaImage
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../../../services/api";

/* ================= MAIN COMPONENT ================= */
const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    department: "all",
    gender: "all",
  });
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [modalState, setModalState] = useState({
    view: false,
    edit: false,
    delete: false,
  });
  const [editForm, setEditForm] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);

  /* ================= FETCH TEACHERS ================= */
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await api.get("/teachers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Ensure we only get the fields we need
      const cleanTeachers = (response.data.data || []).map(teacher => ({
        _id: teacher._id,
        firstName: teacher.firstName || "",
        lastName: teacher.lastName || "",
        gender: teacher.gender || "",
        dateOfBirth: teacher.dateOfBirth || "",
        age: teacher.age || "",
        religion: teacher.religion || "",
        qualification: teacher.qualification || "",
        subject: teacher.subject || "",
        department: teacher.department || "",
        phone: teacher.phone || "",
        email: teacher.email || "",
        teacherPhoto: teacher.teacherPhoto || null,
      }));
      setTeachers(cleanTeachers);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error(error.response?.data?.message || "Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  /* ================= DELETE TEACHER ================= */
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/teachers/${selectedTeacher._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Teacher deleted successfully!");
      setModalState({ ...modalState, delete: false });
      fetchTeachers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete teacher");
    }
  };

  /* ================= UPDATE TEACHER ================= */
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Only append fields we're using
      const fields = [
        'firstName', 'lastName', 'gender', 'dateOfBirth', 'age', 
        'religion', 'qualification', 'subject', 'department', 
        'phone', 'email'
      ];

      fields.forEach(field => {
        if (editForm[field] !== undefined && editForm[field] !== "") {
          formData.append(field, editForm[field].toString());
        }
      });

      // Handle photo separately
      if (editForm.teacherPhoto instanceof File) {
        formData.append('teacherPhoto', editForm.teacherPhoto);
      } else if (editForm.teacherPhoto && typeof editForm.teacherPhoto === 'string') {
        formData.append('teacherPhoto', editForm.teacherPhoto);
      }

      await api.put(`/teachers/${selectedTeacher._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Teacher updated successfully!");
      setModalState({ ...modalState, edit: false });
      setPhotoPreview(null);
      fetchTeachers();
    } catch (error) {
      console.error("Update error:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Update failed. Please check your data.";
      toast.error(`❌ ${errorMessage}`);
    }
  };

  /* ================= FILTER & SORT ================= */
  const filteredTeachers = useMemo(() => {
    let result = [...teachers];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(teacher =>
        `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(term) ||
        teacher.email.toLowerCase().includes(term) ||
        teacher.phone?.toLowerCase().includes(term) ||
        teacher.subject?.toLowerCase().includes(term)
      );
    }

    // Department filter
    if (filters.department !== "all") {
      result = result.filter(teacher => teacher.department === filters.department);
    }

    // Gender filter
    if (filters.gender !== "all") {
      result = result.filter(teacher => teacher.gender === filters.gender);
    }

    return result;
  }, [teachers, searchTerm, filters]);

  /* ================= HANDLERS ================= */
  const handleEditChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "teacherPhoto" && files && files[0]) {
      const file = files[0];
      setEditForm(prev => ({ ...prev, teacherPhoto: file }));
      setPhotoPreview(URL.createObjectURL(file));
      return;
    }

    if (name === "dateOfBirth") {
      const dob = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      
      setEditForm(prev => ({ 
        ...prev, 
        dateOfBirth: value, 
        age: age.toString() 
      }));
      return;
    }

    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const openEditModal = (teacher) => {
    setSelectedTeacher(teacher);
    setEditForm({
      firstName: teacher.firstName || "",
      lastName: teacher.lastName || "",
      gender: teacher.gender || "",
      dateOfBirth: teacher.dateOfBirth?.split("T")[0] || "",
      age: teacher.age || "",
      religion: teacher.religion || "",
      qualification: teacher.qualification || "",
      subject: teacher.subject || "",
      department: teacher.department || "",
      phone: teacher.phone || "",
      email: teacher.email || "",
      teacherPhoto: teacher.teacherPhoto || null,
    });
    setPhotoPreview(teacher.teacherPhoto || null);
    setModalState({ ...modalState, edit: true });
  };

  const openViewModal = (teacher) => {
    setSelectedTeacher(teacher);
    setModalState({ ...modalState, view: true });
  };

  /* ================= OPTIONS ================= */
  const departments = ["all", ...new Set(teachers.map(t => t.department).filter(Boolean))];
  const genderOptions = ["all", "male", "female", "other"];
  const qualifications = [...new Set(teachers.map(t => t.qualification).filter(Boolean))];
  const subjects = [...new Set(teachers.map(t => t.subject).filter(Boolean))];
  const religions = [...new Set(teachers.map(t => t.religion).filter(Boolean))];

  /* ================= RENDER ================= */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="animate-spin h-12 w-12 border-4 border-[#052954] border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-600">Loading teachers...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#052954] mb-2">
              <FaUserTie className="inline mr-3" />
              Teachers Management
            </h1>
            <p className="text-gray-600">
              Total: {teachers.length} teachers • Showing: {filteredTeachers.length}
            </p>
          </div>
          <button
            onClick={fetchTeachers}
            className="flex items-center gap-2 px-4 py-2 bg-[#052954] text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
             Refresh
          </button>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search teachers..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052954]/30 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Department Filter */}
          <div className="relative">
            <FaSchool className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052954]/30 focus:outline-none appearance-none"
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            >
              <option value="all">All Departments</option>
              {departments.slice(1).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {filters.gender === "male" ? <FaMars /> : 
               filters.gender === "female" ? <FaVenus /> : 
               <FaGenderless />}
            </div>
            <select
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052954]/30 focus:outline-none appearance-none"
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
        </div>
      </div>

      {/* TEACHERS TABLE */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#052954] text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Teacher</th>
                <th className="px-4 py-3 text-left font-semibold">Gender</th>
                <th className="px-4 py-3 text-left font-semibold">Department</th>
                <th className="px-4 py-3 text-left font-semibold">Subject</th>
                <th className="px-4 py-3 text-left font-semibold">Qualification</th>
                <th className="px-4 py-3 text-left font-semibold">Contact</th>
                <th className="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-gray-50 transition-colors">
                    {/* Teacher Column */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          {teacher.teacherPhoto ? (
                            <img 
                              src={teacher.teacherPhoto} 
                              alt={teacher.firstName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<FaUserTie className="w-full h-full p-2 text-gray-500" />';
                              }}
                            />
                          ) : (
                            <FaUserTie className="w-full h-full p-2 text-gray-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {teacher.firstName} {teacher.lastName}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {teacher.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Gender Column */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {teacher.gender === "male" && <FaMars className="text-blue-500" />}
                        {teacher.gender === "female" && <FaVenus className="text-pink-500" />}
                        {teacher.gender === "other" && <FaGenderless className="text-gray-500" />}
                        <span className="capitalize">{teacher.gender}</span>
                      </div>
                    </td>

                    {/* Department Column */}
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {teacher.department}
                      </span>
                    </td>

                    {/* Subject Column */}
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        {teacher.subject}
                      </span>
                    </td>

                    {/* Qualification Column */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FaGraduationCap className="text-purple-500" />
                        <span className="text-sm">{teacher.qualification}</span>
                      </div>
                    </td>

                    {/* Contact Column */}
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="text-gray-900 text-sm truncate">{teacher.email}</div>
                        <div className="text-gray-500 text-xs truncate">{teacher.phone}</div>
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openViewModal(teacher)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => openEditModal(teacher)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setModalState({ ...modalState, delete: true });
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center">
                    <div className="text-gray-400 mb-3">
                      <FaUserTie className="text-4xl mx-auto" />
                    </div>
                    <p className="text-gray-500 font-medium">No teachers found</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchTerm || filters.department !== "all" || filters.gender !== "all" 
                        ? "Try adjusting your search or filters" 
                        : "No teachers registered yet"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW TEACHER MODAL */}
      {modalState.view && selectedTeacher && (
        <Modal onClose={() => setModalState({ ...modalState, view: false })}>
          <div className="space-y-6">
            {/* Header with photo */}
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                {selectedTeacher.teacherPhoto ? (
                  <img 
                    src={selectedTeacher.teacherPhoto} 
                    alt={selectedTeacher.firstName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUserTie className="w-full h-full p-6 text-gray-500" />
                )}
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedTeacher.firstName} {selectedTeacher.lastName}
                </h3>
                <p className="text-gray-600">{selectedTeacher.subject} Teacher</p>
                <p className="text-gray-500 text-sm">ID: {selectedTeacher._id?.slice(-6)}</p>
              </div>
            </div>

            {/* Details in 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="First Name" value={selectedTeacher.firstName} />
              <DetailItem label="Last Name" value={selectedTeacher.lastName} />
              <DetailItem label="Gender" value={selectedTeacher.gender} />
              <DetailItem label="Date of Birth" value={selectedTeacher.dateOfBirth?.split("T")[0]} />
              <DetailItem label="Age" value={selectedTeacher.age} />
              <DetailItem label="Religion" value={selectedTeacher.religion} />
              <DetailItem label="Qualification" value={selectedTeacher.qualification} />
              <DetailItem label="Subject" value={selectedTeacher.subject} />
              <DetailItem label="Department" value={selectedTeacher.department} />
              <DetailItem label="Phone" value={selectedTeacher.phone} />
              <DetailItem label="Email" value={selectedTeacher.email} />
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT TEACHER MODAL */}
      {modalState.edit && (
        <Modal 
          onClose={() => {
            setModalState({ ...modalState, edit: false });
            setPhotoPreview(null);
          }}
          title="Edit Teacher"
        >
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={editForm.firstName}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={editForm.lastName}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={editForm.gender}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  name="department"
                  value={editForm.department}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Department</option>
                  {departments.slice(1).map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  name="subject"
                  value={editForm.subject}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subj => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
              </div>

              {/* Qualification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                <select
                  name="qualification"
                  value={editForm.qualification}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Qualification</option>
                  {qualifications.map(qual => (
                    <option key={qual} value={qual}>{qual}</option>
                  ))}
                </select>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={editForm.dateOfBirth}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Religion */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
                <select
                  name="religion"
                  value={editForm.religion}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Religion</option>
                  {religions.map(religion => (
                    <option key={religion} value={religion}>{religion}</option>
                  ))}
                </select>
              </div>

              {/* Photo Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {photoPreview ? (
                      <img 
                        src={photoPreview} 
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : editForm.teacherPhoto && typeof editForm.teacherPhoto === "string" ? (
                      <img 
                        src={editForm.teacherPhoto} 
                        alt="Current"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUserTie className="w-full h-full p-4 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                      <FaImage />
                      Change Photo
                      <input
                        type="file"
                        name="teacherPhoto"
                        accept="image/*"
                        onChange={handleEditChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-gray-500 text-xs mt-2">JPG, PNG up to 5MB</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalState({ ...modalState, edit: false });
                  setPhotoPreview(null);
                }}
                className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {modalState.delete && selectedTeacher && (
        <Modal 
          onClose={() => setModalState({ ...modalState, delete: false })}
          title="Confirm Delete"
        >
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <FaTrash className="text-4xl mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Teacher
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <b>{selectedTeacher.firstName} {selectedTeacher.lastName}</b>?
              <br />
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setModalState({ ...modalState, delete: false })}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        {title && <h2 className="text-xl font-bold text-gray-900">{title}</h2>}
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Close"
        >
          <FaTimes className="text-gray-500" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const DetailItem = ({ label, value }) => (
  <div className="bg-gray-50 rounded-lg p-3">
    <div className="text-xs text-gray-500 mb-1">{label}</div>
    <div className="font-medium text-gray-900">{value || "Not specified"}</div>
  </div>
);

export default Teachers;