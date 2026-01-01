import React, { useEffect, useState } from "react";
import { FaBullhorn, FaImage, FaCalendarAlt, FaUser, FaArrowRight } from "react-icons/fa";
import { IoImage } from "react-icons/io5";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetch("/annouce.json")
      .then((res) => res.json())
      .then((data) => {
        setAnnouncements(data.announce);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Function to truncate text
  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
  };

  // Modal for image preview
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
            alt="Full preview"
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
        <div className="mb-8 md:mb-12">
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
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                          onClick={() => a.image && setSelectedImage(a.image)}
                        />
                        <div 
                          className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-lg cursor-pointer hover:bg-black/80 transition"
                          onClick={() => a.image && setSelectedImage(a.image)}
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
                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <div className="flex flex-wrap items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-2">
                            <FaCalendarAlt className="text-[#052954]" />
                            {new Date(a.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="flex items-center gap-2">
                            <FaUser className="text-[#052954]" />
                            {a.author}
                          </span>
                        </div>
                        
                        {a.image && (
                          <button
                            onClick={() => a.image && setSelectedImage(a.image)}
                            className="flex items-center gap-2 text-[#052954] font-medium hover:text-[#052954]/80 transition mt-2 sm:mt-0"
                          >
                            <FaImage /> View Image
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Read More Button */}
                    {a.description.length > 120 && (
                      <button className="mt-4 text-[#052954] font-semibold flex items-center gap-2 hover:text-[#052954]/80 transition group">
                        Read more
                        <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
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
                    {announcements.filter(a => a.image).length}
                  </div>
                  <div className="text-gray-600">With Images</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

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
      `}</style>
    </div>
  );
};

export default Announcements;