import React, { useEffect, useState } from "react";
import {
  FaSearch,
  FaFilter,
  FaUser,
  FaEye,
  FaEdit,
  FaTrash,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaExclamationTriangle,
} from "react-icons/fa";

const Parent = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetch("/parent.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch parents");
        return res.json();
      })
      .then((data) => {
        setParents(data.parent);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const filteredParents = parents
    .filter((p) => {
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass =
        filterClass === "all" || p.childClass === filterClass;
      const matchesStatus = filterStatus === "all" || p.status === filterStatus;
      return matchesSearch && matchesClass && matchesStatus;
    })
    .sort((a, b) => {
      if (sortConfig.key === "name") {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return sortConfig.direction === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }
      if (sortConfig.key === "class") {
        return sortConfig.direction === "asc"
          ? a.childClass.localeCompare(b.childClass)
          : b.childClass.localeCompare(a.childClass);
      }
      return 0;
    });

  const totalPages = Math.ceil(filteredParents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedParents = filteredParents.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  if (loading) return <Loading message="Loading parents..." />;
  if (error) return <Error message={error} />;

  const uniqueClasses = [...new Set(parents.map((p) => p.childClass))];

  return (
    <div className="p-4 md:p-6 bg-gray-200 min-h-screen">
      <Header
        title="Parents Management"
        subtitle="Manage and view all parent records"
      />

      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterClass={filterClass}
        setFilterClass={setFilterClass}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        uniqueClasses={uniqueClasses}
      />

      <Table
        data={paginatedParents}
        sortConfig={sortConfig}
        handleSort={handleSort}
        startIndex={startIndex}
      />

      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
      />
    </div>
  );
};

/* ===== REUSABLE COMPONENTS ===== */

const Header = ({ title, subtitle }) => (
  <div className="mb-6">
    <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
    <p className="text-gray-600">{subtitle}</p>
  </div>
);

const Loading = ({ message }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full mx-auto"></div>
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  </div>
);

const Error = ({ message }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="bg-red-50 p-6 rounded-xl text-center">
      <FaExclamationTriangle className="text-red-600 text-4xl mx-auto mb-3" />
      <p className="text-red-600">{message}</p>
    </div>
  </div>
);

const SearchFilter = ({
  searchTerm,
  setSearchTerm,
  filterClass,
  setFilterClass,
  filterStatus,
  setFilterStatus,
  uniqueClasses,
}) => (
  <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1 relative">
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
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="px-6 py-3 rounded-full border border-gray-300 bg-gray-50
          focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="all">All Classes</option>
          {uniqueClasses.map((cls) => (
            <option key={cls} value={cls}>
              Class {cls}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-6 py-3 rounded-full border border-gray-300 bg-gray-50
          focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>
  </div>
);

const Table = ({ data, sortConfig, handleSort, startIndex }) => (
  <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
    <table className="min-w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-4">Image</th>
          
          <th className="px-6 py-4 text-left">
            <button
              onClick={() => handleSort("name")}
              className="flex items-center gap-2"
            >
              Parent
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
          <th className="px-6 py-4">Child</th>
          <th className="px-6 py-4">Class</th>
          <th className="px-6 py-4">Email</th>
          <th className="px-6 py-4">Status</th>
          <th className="px-6 py-4">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((p, i) => (
          <tr key={i} className="hover:bg-gray-50">
            <div className="w-full h-full rounded-full flex items-center justify-center">
            <FaUser className="text-blue-600 text-xl" />
          </div>
            <td className="px-6 py-4">
              {p.firstName} {p.lastName}
            </td>
            <td className="px-6 py-4">{p.gender}</td>
            <td className="px-6 py-4">{p.childName}</td>
            <td className="px-6 py-4">{p.childClass}</td>
            <td className="px-6 py-4">{p.email}</td>
            <td className="px-6 py-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  p.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {p.status}
              </span>
            </td>
            <td className="px-6 py-4 flex gap-2">
              <FaEye className="text-blue-600 cursor-pointer" />
              <FaEdit className="text-green-600 cursor-pointer" />
              <FaTrash className="text-red-600 cursor-pointer" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {data.length === 0 && (
      <div className="py-10 text-center text-gray-500">No parent found</div>
    )}
  </div>
);

const Pagination = ({ currentPage, setCurrentPage, totalPages }) => {
  const pageWindow = 5;
  const startPage = Math.max(1, currentPage - Math.floor(pageWindow / 2));
  const endPage = Math.min(totalPages, startPage + pageWindow - 1);
  const visiblePages = [];
  for (let i = startPage; i <= endPage; i++) visiblePages.push(i);

  return (
    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
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
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-full border hover:bg-gray-100 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Parent;
