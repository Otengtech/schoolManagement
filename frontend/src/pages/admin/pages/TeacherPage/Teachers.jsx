import { useEffect, useState } from "react";
import {
  FaUserTie,
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaTrash,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaExclamationTriangle,
} from "react-icons/fa";

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterGender, setFilterGender] = useState("all");

  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  /* ================= FETCH TEACHERS ================= */
  useEffect(() => {
    fetch("/teacher.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch teachers");
        return res.json();
      })
      .then((data) => {
        setTeachers(data.teacher);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  /* ================= SORT ================= */
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  /* ================= FILTER + SORT ================= */
  const filteredTeachers = teachers
    .filter((t) => {
      const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment =
        filterDepartment === "all" || t.department === filterDepartment;

      const matchesGender =
        filterGender === "all" || t.gender === filterGender;

      return matchesSearch && matchesDepartment && matchesGender;
    })
    .sort((a, b) => {
      if (sortConfig.key === "name") {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return sortConfig.direction === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }

      if (sortConfig.key === "department") {
        return sortConfig.direction === "asc"
          ? a.department.localeCompare(b.department)
          : b.department.localeCompare(a.department);
      }
      return 0;
    });

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTeachers = filteredTeachers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const pageWindow = 5;
  const startPage = Math.max(
    1,
    currentPage - Math.floor(pageWindow / 2)
  );
  const endPage = Math.min(totalPages, startPage + pageWindow - 1);

  const visiblePages = [];
  for (let i = startPage; i <= endPage; i++) visiblePages.push(i);

  const uniqueDepartments = [
    ...new Set(teachers.map((t) => t.department)),
  ];

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading teachers...</p>
        </div>
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 p-6 rounded-xl text-center">
          <FaExclamationTriangle className="text-red-600 text-4xl mx-auto mb-3" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-200 min-h-screen">
      {/* ================= HEADER ================= */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Teachers Management
        </h1>
        <p className="text-gray-600">
          Manage and view all teachers records
        </p>
      </div>

      {/* ================= SEARCH & FILTER ================= */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 bg-gray-50
              focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="pl-12 pr-8 py-3 rounded-full border border-gray-300 bg-gray-50
                focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Departments</option>
                {uniqueDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="px-6 py-3 rounded-full border border-gray-300 bg-gray-50
              focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-2"
                >
                  Teacher
                  {sortConfig.key === "name" ? (
                    sortConfig.direction === "asc" ? (
                      <FaSortUp />
                    ) : (
                      <FaSortDown />
                    )
                  ) : (
                    <FaSort />
                  )}
                </button>
              </th>
              <th className="px-6 py-4">Gender</th>
              <th className="px-6 py-4">
                <button
                  onClick={() => handleSort("department")}
                  className="flex items-center gap-2"
                >
                  Department
                  <FaSort />
                </button>
              </th>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedTeachers.map((t) => (
              <tr key={t.teacherId} className="hover:bg-gray-50">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaUserTie className="text-blue-600" />
                  </div>
                  {t.firstName} {t.lastName}
                </td>
                <td className="px-6 py-4 capitalize">{t.gender}</td>
                <td className="px-6 py-4">{t.department}</td>
                <td className="px-6 py-4">{t.subject}</td>
                <td className="px-6 py-4">{t.email}</td>
                <td className="px-6 py-4 flex gap-2">
                  <FaEye className="text-blue-600 cursor-pointer" />
                  <FaEdit className="text-green-600 cursor-pointer" />
                  <FaTrash className="text-red-600 cursor-pointer" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTeachers.length === 0 && (
          <div className="py-10 text-center text-gray-500">
            No teacher found
          </div>
        )}
      </div>

      {/* ================= PAGINATION ================= */}
      {filteredTeachers.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1}–
            {Math.min(startIndex + itemsPerPage, filteredTeachers.length)} of{" "}
            {filteredTeachers.length}
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-full border hover:bg-gray-100 disabled:opacity-50"
            >
              Prev
            </button>

            {visiblePages.map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`px-4 py-2 rounded-full ${
                  p === currentPage
                    ? "bg-blue-600 text-white"
                    : "border hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-full border hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
