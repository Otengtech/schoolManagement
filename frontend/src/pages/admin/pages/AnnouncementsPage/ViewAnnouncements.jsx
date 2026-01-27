import React, { useEffect, useState } from "react";
import { 
  FaBullhorn, 
  FaCalendarAlt, 
  FaSync,
  FaExclamationTriangle,
  FaEnvelope,
  FaSms,
  FaMobileAlt,
  FaFilter,
  FaTimes,
  FaChevronRight,
  FaUserTie,
  FaTrash,
  FaUsers,
  FaRegCopy
} from "react-icons/fa";
import schoolLogo from "../../../../assets/school-logo.png";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [filters, setFilters] = useState({
    role: "",
    channel: "",
    important: false,
    date: ""
  });

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "";
    setUserRole(role);
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Please login to view announcements");
        setLoading(false);
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_API_URI || "https://school-management-system-backend-three.vercel.app";
      
      const response = await fetch(`${API_BASE_URL}/get-announce`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch announcements: ${response.status}`);
      }

      const data = await response.json();
      console.log("Announcements data:", data);
      
      const transformedAnnouncements = data.data ? data.data.map((announcement) => ({
        id: announcement._id,
        title: announcement.title,
        description: announcement.description,
        date: announcement.date,
        author: announcement.author,
        createdAt: announcement.createdAt,
        updatedAt: announcement.updatedAt,
        deliveryStatus: announcement.deliveryStatus || "sent",
        image: announcement.image || schoolLogo,
        recipients: announcement.recipients || { roles: [], specificUsers: [] },
        channels: announcement.channels || { email: true, sms: false, inApp: true },
        important: false // Add if you have important field in API
      })) : [];
      
      setAnnouncements(transformedAnnouncements);
      setFilteredAnnouncements(transformedAnnouncements);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError(err.message || "Failed to load announcements");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    let result = [...announcements];
    
    // Filter by role
    if (filters.role) {
      result = result.filter(a => 
        a.recipients?.roles?.includes(filters.role)
      );
    }
    
    // Filter by channel
    if (filters.channel) {
      result = result.filter(a => 
        a.channels?.[filters.channel]
      );
    }
    
    // Filter by important
    if (filters.important) {
      result = result.filter(a => a.important);
    }
    
    // Filter by date
    if (filters.date) {
      const filterDate = new Date(filters.date);
      result = result.filter(a => {
        const announcementDate = new Date(a.date);
        return announcementDate.toDateString() === filterDate.toDateString();
      });
    }
    
    setFilteredAnnouncements(result);
  }, [filters, announcements]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) {
      return;
    }

    setDeletingId(announcementId);
    try {
      const token = localStorage.getItem("token");
      const API_BASE_URL = import.meta.env.VITE_API_URI || "https://school-management-system-backend-three.vercel.app";
      
      const response = await fetch(`${API_BASE_URL}/del-announce/${announcementId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete announcement: ${response.status}`);
      }

      setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
      alert("Announcement deleted successfully!");
      
    } catch (err) {
      console.error("Error deleting announcement:", err);
      alert(err.message || "Failed to delete announcement");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getRecipientLabel = (recipients) => {
    if (!recipients || !recipients.roles) return "Everyone";
    
    const roleLabels = {
      parent: "Parents",
      teacher: "Teachers",
      student: "Students",
      admin: "Admins",
      all: "Everyone"
    };
    
    if (recipients.roles.includes("all")) return "Everyone";
    
    return recipients.roles
      .map(role => roleLabels[role] || role)
      .join(", ");
  };

  const getChannelIcons = (channels) => {
    if (!channels) return [];
    
    const icons = [];
    if (channels.email) icons.push(<FaEnvelope key="email" className="text-gray-500 text-xs" title="Email" />);
    if (channels.sms) icons.push(<FaSms key="sms" className="text-gray-500 text-xs" title="SMS" />);
    if (channels.inApp) icons.push(<FaMobileAlt key="inApp" className="text-gray-500 text-xs" title="In-App" />);
    
    return icons;
  };

  const clearFilters = () => {
    setFilters({
      role: "",
      channel: "",
      important: false,
      date: ""
    });
  };

  const canDelete = () => userRole === "admin";

  // Minimal Announcement Detail View
  const AnnouncementDetail = ({ announcement, onClose }) => {
    if (!announcement) return null;

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div 
          className="relative bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center justify-start gap-4 mb-2">
                <img src={schoolLogo} alt="school logo" className="w-10 h-10 rounded-full" />
                <h2 className="text-xl font-bold text-gray-800">{announcement.title}</h2>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <FaUserTie className="text-xs" />
                    {announcement.author?.firstName} {announcement.author?.lastName}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <FaCalendarAlt className="text-xs" />
                    {new Date(announcement.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="prose max-w-none text-gray-700 whitespace-pre-line">
              {announcement.description}
            </div>

            {/* Meta Info */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Recipients</p>
                  <p className="font-medium">{getRecipientLabel(announcement.recipients)}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Channels</p>
                  <div className="flex items-center gap-2">
                    {getChannelIcons(announcement.channels)}
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Delivery Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs ${announcement.deliveryStatus === 'sent' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {announcement.deliveryStatus}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Posted</p>
                  <p className="font-medium">
                    {formatDate(announcement.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(announcement.description);
                  alert('Copied to clipboard');
                }}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
              >
                <FaRegCopy /> Copy
              </button>
              <div className="flex gap-3">
                {/* {canDelete() && ( */}
                  <button
                    onClick={() => {
                      if (window.confirm("Delete this announcement?")) {
                        handleDeleteAnnouncement(announcement.id);
                        onClose();
                      }
                    }}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                  >
                    Delete
                  </button>
                {/* )} */}
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gray-900 p-2 rounded-lg text-white">
                <FaBullhorn size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
                <p className="text-gray-600">Latest updates and notices</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 hover:bg-gray-200 rounded-lg transition"
                title="Refresh"
              >
                <FaSync className={`${refreshing ? 'animate-spin' : ''}`} />
              </button>
              {canDelete() && (
                <div className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  Admin
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaFilter /> Filters
              </div>
              {(filters.role || filters.channel || filters.important || filters.date) && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  Clear filters <FaTimes />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-4">
              {/* Role Filter */}
              <select
                value={filters.role}
                onChange={(e) => setFilters({...filters, role: e.target.value})}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-gray-500"
              >
                <option value="">All Recipients</option>
                <option value="parent">Parents</option>
                <option value="teacher">Teachers</option>
                <option value="student">Students</option>
                <option value="admin">Admins</option>
                <option value="all">Everyone</option>
              </select>

              {/* Channel Filter */}
              <select
                value={filters.channel}
                onChange={(e) => setFilters({...filters, channel: e.target.value})}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-gray-500"
              >
                <option value="">All Channels</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="inApp">In-App</option>
              </select>

              {/* Date Filter */}
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({...filters, date: e.target.value})}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            {/* Announcements List */}
            <div className="space-y-4">
              {filteredAnnouncements.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                  <div className="text-gray-400 mb-4">
                    <FaBullhorn size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No announcements found
                  </h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    {filters.role || filters.channel || filters.important || filters.date 
                      ? "Try changing your filters" 
                      : "Check back later for updates"}
                  </p>
                </div>
              ) : (
                filteredAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="group bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => setSelectedAnnouncement(announcement)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Title and Info */}
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-gray-700">
                              {announcement.title}
                            </h3>
                            {canDelete() && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAnnouncement(announcement.id);
                                }}
                                disabled={deletingId === announcement.id}
                                className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete announcement"
                              >
                                {deletingId === announcement.id ? (
                                  <FaSync className="animate-spin" />
                                ) : (
                                  <FaTrash size={12} />
                                )}
                              </button>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {announcement.description}
                          </p>

                          {/* Meta Info */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <FaUserTie />
                              {announcement.author?.firstName} {announcement.author?.lastName}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <FaCalendarAlt />
                              {formatDate(announcement.date)}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <FaUsers />
                              {getRecipientLabel(announcement.recipients)}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-2">
                              {getChannelIcons(announcement.channels)}
                            </span>
                            <span className="ml-auto flex items-center gap-1 text-gray-400 group-hover:text-gray-600">
                              View details <FaChevronRight className="text-xs" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Stats */}
            <div className="mt-8">
              <div className="text-sm text-gray-600">
                Showing {filteredAnnouncements.length} of {announcements.length} announcements
                {(filters.role || filters.channel || filters.important || filters.date) && (
                  <span className="text-gray-500">
                    {' '}(filtered)
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Announcement Detail Modal */}
      <AnnouncementDetail 
        announcement={selectedAnnouncement} 
        onClose={() => setSelectedAnnouncement(null)}
      />

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .prose {
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
};

export default Announcements;