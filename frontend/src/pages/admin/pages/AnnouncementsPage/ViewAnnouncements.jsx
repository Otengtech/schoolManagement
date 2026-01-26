import React, { useEffect, useState } from "react";
import { 
  FaBullhorn, 
  FaImage, 
  FaCalendarAlt, 
  FaArrowRight, 
  FaEnvelope,
  FaSms,
  FaMobileAlt,
  FaUsers,
  FaExclamationTriangle,
  FaSync,
  FaTimes,
  FaExpand,
  FaRegCopy
} from "react-icons/fa";
import { IoImage } from "react-icons/io5";
import schoolLogo from "../../../../assets/school-logo.png";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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
      
      const transformedAnnouncements = data.announcements ? data.announcements.map((announcement, index) => ({
        id: announcement._id || index,
        title: announcement.title,
        description: announcement.description,
        date: announcement.date,
        important: announcement.important || false,
        image: schoolLogo,
        recipients: announcement.recipients || { roles: [], specificUsers: [] },
        channels: announcement.channels || { email: true, sms: false, inApp: true },
        createdAt: announcement.createdAt || new Date().toISOString()
      })) : [];
      
      setAnnouncements(transformedAnnouncements);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError(err.message || "Failed to load announcements");
      
      try {
        const fallbackResponse = await fetch("/annouce.json");
        const fallbackData = await fallbackResponse.json();
        const fallbackAnnouncements = fallbackData.announce ? fallbackData.announce.map((item, index) => ({
          ...item,
          id: item.id || index,
          image: schoolLogo,
        })) : [];
        setAnnouncements(fallbackAnnouncements);
      } catch (fallbackErr) {
        console.error("Fallback also failed:", fallbackErr);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
  };

  const getRecipientLabels = (recipients) => {
    if (!recipients || !recipients.roles) return "Everyone";
    
    const roleLabels = {
      parent: "Parents",
      teacher: "Teachers",
      student: "Students",
      staff: "Staff",
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
    if (channels.email) icons.push({ icon: <FaEnvelope className="text-blue-600" />, label: "Email" });
    if (channels.sms) icons.push({ icon: <FaSms className="text-green-600" />, label: "SMS" });
    if (channels.inApp) icons.push({ icon: <FaMobileAlt className="text-purple-600" />, label: "In-App" });
    
    return icons;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCopyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Announcement copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Preview Modal Component
  const AnnouncementPreviewModal = ({ announcement, onClose }) => {
    if (!announcement) return null;

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div 
          className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-[#052954] p-2 rounded-lg text-white">
                <FaBullhorn size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Announcement Preview</h2>
                <p className="text-gray-600 text-sm">Full details and content</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyToClipboard(announcement.description)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Copy to clipboard"
              >
                <FaRegCopy className="text-gray-600" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FaTimes size={24} className="text-gray-600 hover:text-gray-800" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Title and Badge */}
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 pr-4">
                {announcement.title}
              </h3>
              {announcement.important && (
                <span className="bg-red-100 text-red-700 text-sm font-bold px-4 py-1.5 rounded-full whitespace-nowrap shrink-0">
                  ⚠️ IMPORTANT
                </span>
              )}
            </div>

            {/* Image Preview */}
            {announcement.image && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <FaImage className="text-[#052954]" />
                    Attached Image
                  </h4>
                  
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <img
                    src={announcement.image}
                    alt="Announcement"
                    className="max-h-60 mx-auto object-contain rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Full Description */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaBullhorn className="text-[#052954]" />
                Full Content
              </h4>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                  {announcement.description}
                </div>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Date */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <FaCalendarAlt className="text-[#052954]" />
                  <span className="font-semibold text-gray-700">Published Date</span>
                </div>
                <p className="text-gray-600 pl-8">{formatDate(announcement.date)}</p>
              </div>

              {/* Recipients */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <FaUsers className="text-[#052954]" />
                  <span className="font-semibold text-gray-700">Recipients</span>
                </div>
                <p className="text-gray-600 pl-8">{getRecipientLabels(announcement.recipients)}</p>
              </div>

              {/* Channels */}
              <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <FaMobileAlt className="text-[#052954]" />
                  <span className="font-semibold text-gray-700">Delivery Channels</span>
                </div>
                <div className="flex flex-wrap gap-4 pl-8">
                  {getChannelIcons(announcement.channels).map((channel, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg">
                      {channel.icon}
                      <span className="text-gray-700 font-medium">{channel.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Info */}
            {announcement.createdAt && (
              <div className="text-sm text-gray-500 mt-4 pt-4 border-t border-gray-200">
                Created: {formatDate(announcement.createdAt)}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleCopyToClipboard(announcement.description)}
                className="px-4 py-2 border border-[#052954] text-[#052954] rounded-lg hover:bg-[#052954]/5 transition flex items-center gap-2"
              >
                <FaRegCopy /> Copy Content
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-[#052954] text-white rounded-lg hover:bg-[#052954]/90 transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Image Modal Component
  const ImageModal = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onClose}
            className="absolute -top-10 right-0 text-white text-2xl hover:text-yellow-400 transition"
          >
            ✕
          </button>
          <img
            src={imageUrl}
            alt="School announcement"
            className="rounded-xl max-w-full max-h-[80vh] object-contain"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#052954] mb-3 flex items-center gap-3">
              <div className="bg-[#052954] p-3 rounded-xl text-white">
                <FaBullhorn size={24} />
              </div>
              School Announcements
            </h1>
            <p className="text-gray-600 text-lg">
              Stay updated with the latest news and important notices
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            <FaSync className={`${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <FaExclamationTriangle className="text-red-600" />
            <div>
              <p className="text-red-700 font-medium">{error}</p>
              <p className="text-red-600 text-sm mt-1">Using cached data or fallback</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#052954]"></div>
          </div>
        ) : (
          <>
            {/* Announcements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {announcements.map((a) => (
                <div
                  key={a.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-[#052954]/20 hover:-translate-y-1"
                >
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-gray-100">
                    {a.image ? (
                      <>
                        <img
                          src={a.image}
                          alt={a.title}
                          className="w-full h-full object-contain p-4 bg-white group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                          onClick={() => setSelectedAnnouncement(a)}
                        />
                        <div 
                          className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-lg cursor-pointer hover:bg-black/80 transition"
                          onClick={() => setSelectedAnnouncement(a)}
                        >
                          <IoImage size={20} />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <FaImage size={48} className="mb-3 opacity-50" />
                        <span className="text-sm">No image</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                      <span className="text-white text-xs font-medium bg-[#052954] px-3 py-1 rounded-full">
                        Announcement
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h2 className="text-xl font-bold text-gray-800 group-hover:text-[#052954] transition-colors line-clamp-2">
                        {a.title}
                      </h2>
                      {a.important && (
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ml-2">
                          IMPORTANT
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {truncateText(a.description, 120)}
                    </p>

                    {/* Meta Information */}
                    <div className="space-y-3 border-t border-gray-100 pt-4 mt-4">
                      {/* Date */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaCalendarAlt className="text-[#052954]" />
                        <span>
                          {new Date(a.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>

                      {/* Recipients */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaUsers className="text-[#052954]" />
                        <span className="font-medium">To: </span>
                        <span>{getRecipientLabels(a.recipients)}</span>
                      </div>

                      {/* Channels */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getChannelIcons(a.channels).map((channel, index) => (
                            <div key={index} className="flex items-center gap-1" title={channel.label}>
                              {channel.icon}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setSelectedAnnouncement(a)}
                        className="flex-1 bg-[#052954] text-white font-semibold py-2.5 rounded-lg hover:bg-[#052954]/90 transition flex items-center justify-center gap-2 group"
                      >
                        <FaExpand size={14} />
                        View Full Announcement
                      </button>
                      {a.image && (
                        <button
                          onClick={() => setSelectedImage(a.image)}
                          className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                          title="View logo"
                        >
                          <FaImage className="text-[#052954]" size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {announcements.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                <div className="text-gray-400 mb-4">
                  <FaBullhorn size={64} className="mx-auto mb-4" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  No Announcements Yet
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Check back later for the latest news and important updates from the school.
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
              <div className="flex flex-wrap items-center justify-between">
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-[#052954]">
                    {announcements.length}
                  </div>
                  <div className="text-gray-600">Total Announcements</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-[#052954]">
                    {announcements.filter(a => a.important).length}
                  </div>
                  <div className="text-gray-600">Important</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-[#052954]">
                    {announcements.filter(a => a.channels?.sms).length}
                  </div>
                  <div className="text-gray-600">SMS Sent</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-[#052954]">
                    {announcements.filter(a => a.channels?.inApp).length}
                  </div>
                  <div className="text-gray-600">In-App Notifications</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Announcement Preview Modal */}
      <AnnouncementPreviewModal 
        announcement={selectedAnnouncement} 
        onClose={() => setSelectedAnnouncement(null)} 
      />

      {/* Image Preview Modal */}
      <ImageModal 
        imageUrl={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />

      {/* Add to your CSS file or style tag */}
      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .prose {
          line-height: 1.75;
        }
        .prose p {
          margin-bottom: 1rem;
        }
        .prose p:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default Announcements;