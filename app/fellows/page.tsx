"use client";

import React, { useEffect, useState, useContext } from "react";
import { fetchAllUsers, fetchCourses, sendConnectionRequest, getConnections, getConnectionRequests, acceptConnectionRequest, rejectConnectionRequest } from "@/lib/actions";
import { UserContext } from "@/context/user-context";
import toast from "react-hot-toast";
import { RefreshCw, Search, Mail, Phone, Linkedin, Filter, ChevronLeft, ChevronRight, Check, X, MapPin, GraduationCap, Users } from "lucide-react";
import { FaUser } from "react-icons/fa";

const INDUSTRIES = [
  "AI and Data Science",
  "Computer Vision",
  "NLP",
  "Machine Learning",
  "Generative AI"
];

const ITEMS_PER_PAGE = 9; // 3x3 grid for larger cards

const FellowsPage = () => {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [showOnlyConnections, setShowOnlyConnections] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [connections, setConnections] = useState<any[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const { currentUserID } = useContext(UserContext);

  const loadAllUsers = async () => {
    try {
      setRefreshing(true);
      const users = await fetchAllUsers();
      // Filter out current user and only show approved users
      const filteredUsers = users.filter(user =>
        user.id !== currentUserID && user.status === "approved"
      );
      setAllUsers(filteredUsers);
      setFilteredUsers(filteredUsers);
    } catch (e) {
      toast.error("Failed to fetch users");
      console.error(e);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const courseList = await fetchCourses();
      setCourses(courseList);
    } catch (e) {
      console.error("Failed to fetch courses", e);
    }
  };

  const loadConnections = async () => {
    if (currentUserID) {
      try {
        const conns = await getConnections(currentUserID);
        setConnections(conns);
      } catch (e) {
        console.error("Failed to load connections", e);
      }
    }
  };

  const loadConnectionRequests = async () => {
    if (currentUserID) {
      try {
        const requests = await getConnectionRequests(currentUserID);
        setConnectionRequests(requests);
      } catch (e) {
        console.error("Failed to load connection requests", e);
      }
    }
  };

  useEffect(() => {
    setLoading(true);
    loadAllUsers();
    loadCourses();
    loadConnections();
    loadConnectionRequests();
  }, [currentUserID]);

  const isConnected = (userId: string) => {
    return connections.some(
      conn => conn.status === "accepted" &&
        ((conn.fromUserId === currentUserID && conn.toUserId === userId) ||
          (conn.fromUserId === userId && conn.toUserId === currentUserID))
    );
  };

  useEffect(() => {
    let filtered = [...allUsers];

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.personalDetails?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.connectionDetails?.emailAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.employmentDetails?.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCourses.length > 0) {
      filtered = filtered.filter(user =>
        user.selectedCourses?.some((course: string) => selectedCourses.includes(course))
      );
    }

    if (selectedIndustries.length > 0) {
      filtered = filtered.filter(user =>
        selectedIndustries.includes(user.employmentDetails?.industry)
      );
    }

    // Filter to show only connections
    if (showOnlyConnections) {
      filtered = filtered.filter(user => isConnected(user.id));
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedCourses, selectedIndustries, showOnlyConnections, allUsers, connections, currentUserID]);

  const handleCourseFilter = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(c => c !== courseId)
        : [...prev, courseId]
    );
  };

  const handleIndustryFilter = (industry: string) => {
    setSelectedIndustries(prev =>
      prev.includes(industry)
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    );
  };

  const clearFilters = () => {
    setSelectedCourses([]);
    setSelectedIndustries([]);
    setSearchTerm("");
    setShowOnlyConnections(false);
  };

  const handleConnect = async (userId: string) => {
    if (!currentUserID) {
      toast.error("Please login to connect");
      return;
    }

    const isConnected = connections.some(
      conn => conn.status === "accepted" &&
        ((conn.fromUserId === currentUserID && conn.toUserId === userId) ||
          (conn.fromUserId === userId && conn.toUserId === currentUserID))
    );

    if (isConnected) {
      toast.error("Already connected");
      return;
    }

    const requestSent = connections.some(
      conn => conn.status === "pending" &&
        conn.fromUserId === currentUserID &&
        conn.toUserId === userId
    );

    if (requestSent) {
      toast.error("Connection request already sent");
      return;
    }

    const pendingRequest = connections.some(
      conn => conn.status === "pending" &&
        conn.fromUserId === userId &&
        conn.toUserId === currentUserID
    );

    if (pendingRequest) {
      toast.error("This user has already sent you a connection request. Check your notifications.");
      return;
    }

    await sendConnectionRequest(currentUserID, userId);
    loadConnections();
    loadConnectionRequests();
  };

  const handleAcceptRequest = async (requestId: string, fromUserId: string) => {
    if (!currentUserID) return;
    await acceptConnectionRequest(requestId, fromUserId, currentUserID);
    loadConnectionRequests();
    loadConnections();
  };

  const handleRejectRequest = async (requestId: string) => {
    await rejectConnectionRequest(requestId);
    loadConnectionRequests();
  };

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayValue = (value: string | undefined | null) => {
    return value ? value : "—";
  };

  const hasPendingRequest = (userId: string) => {
    return connections.some(
      conn => conn.status === "pending" &&
        conn.fromUserId === currentUserID &&
        conn.toUserId === userId
    );
  };

  const connectedUsersCount = allUsers.filter(user => isConnected(user.id)).length;

  return (
    <div className="no-scrollbar min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-12 mt-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fellows</h1>
          </div>
          <button
            onClick={() => {
              loadAllUsers();
              loadConnections();
              loadConnectionRequests();
            }}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Connection Requests */}
        {connectionRequests.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Connection Requests ({connectionRequests.length})
            </h2>
            <div className="space-y-3">
              {connectionRequests.map(request => (
                <div key={request.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{request.fromUserName}</p>
                    <p className="text-sm text-gray-500">wants to connect with you</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptRequest(request.id, request.fromUserId)}
                      className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check size={16} />
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X size={16} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or industry..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowOnlyConnections(!showOnlyConnections)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${showOnlyConnections
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  <Users size={18} />
                  My Connections
                  {showOnlyConnections && (
                    <span className="bg-white text-blue-600 text-xs rounded-full px-2 py-0.5">
                      {connectedUsersCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter size={18} />
                  Filters
                  {(selectedCourses.length > 0 || selectedIndustries.length > 0) && (
                    <span className="bg-slate-800 text-white text-xs rounded-full px-2 py-0.5">
                      {selectedCourses.length + selectedIndustries.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="border-t border-gray-200 pt-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Filter by Course</h3>
                  <div className="flex flex-wrap gap-2">
                    {courses.map(course => (
                      <button
                        key={course.id}
                        onClick={() => handleCourseFilter(course.id)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedCourses.includes(course.id)
                          ? "bg-slate-800 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        {course.courseName}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Filter by Industry</h3>
                  <div className="flex flex-wrap gap-2">
                    {INDUSTRIES.map(industry => (
                      <button
                        key={industry}
                        onClick={() => handleIndustryFilter(industry)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedIndustries.includes(industry)
                          ? "bg-slate-800 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        {industry}
                      </button>
                    ))}
                  </div>
                </div>

                {(selectedCourses.length > 0 || selectedIndustries.length > 0 || showOnlyConnections) && (
                  <button
                    onClick={clearFilters}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Users Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
            </div>
          ) : currentUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || selectedCourses.length > 0 || selectedIndustries.length > 0 || showOnlyConnections
                ? "No approved fellows match your search criteria"
                : "No approved fellows found"}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentUsers.map(user => (
                  <div key={user.id} className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-3xl p-8 hover:shadow-xl transition-all hover:border-slate-300">
                    {/* Header with Enrollment Number */}
                    <div className="text-center mb-6">
                      <p className="text-xs font-medium text-gray-500 mb-4">
                      </p>

                      {/* Profile Image */}
                      <div className="relative w-40 h-40 mx-auto mb-4">
                        <div className="w-full h-full rounded-full overflow-hidden border-4 border-blue-100 bg-gradient-to-br from-blue-100 to-blue-50">
                          {user.personalDetails?.profileImage ? (
                            <img
                              src={user.personalDetails.profileImage}
                              alt={user.personalDetails?.fullName || "User"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FaUser className="text-blue-400" size={80} />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Name and Role */}
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {displayValue(user.personalDetails?.fullName)}
                      </h3>

                    </div>

                    {/* Graduated Section */}
                    <div className="mb-6 text-left">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <GraduationCap size={16} />
                        Courses:
                      </h4>
                      <div className="space-y-1 pl-6">
                        {user.selectedCourses && user.selectedCourses.length > 0 ? (
                          user.selectedCourses.map((courseId: string) => {
                            const course = courses.find(c => c.id === courseId);
                            return course ? (
                              <p key={courseId} className="text-sm text-gray-700">
                                {course.courseName}
                              </p>
                            ) : null;
                          })
                        ) : (
                          <p className="text-sm text-gray-500">No courses selected</p>
                        )}
                      </div>
                    </div>

                   

                    {/* Contact Icons */}
                    <div className="flex justify-center gap-3 mb-6">
                      {/* Email */}
                      <a
                        href={`mailto:${user.connectionDetails?.emailAddress}`}
                        className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                        title="Email"
                      >
                        <Mail size={20} />
                      </a>

                      {/* LinkedIn */}
                      {user.connectionDetails?.linkedIn && (
                        <a
                          href={user.connectionDetails.linkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
                          title="LinkedIn"
                        >
                          <Linkedin size={20} />
                        </a>
                      )}

                      {/* Phone */}
                      {user.connectionDetails?.contactNumber && (
                        <a
                          href={`tel:${user.connectionDetails.contactNumber}`}
                          className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white hover:bg-green-600 transition-colors"
                          title="Phone"
                        >
                          <Phone size={20} />
                        </a>
                      )}
                    </div>

                    {/* Connect Button */}
                    <button
                      onClick={() => handleConnect(user.id)}
                      disabled={isConnected(user.id) || hasPendingRequest(user.id)}
                      className={`w-full py-3 rounded-xl font-semibold transition-all ${isConnected(user.id)
                          ? "bg-green-600 text-white cursor-not-allowed"
                          : hasPendingRequest(user.id)
                            ? "bg-amber-500 text-white cursor-not-allowed"
                            : "bg-gradient-to-r from-slate-700 to-slate-900 text-white hover:from-slate-800 hover:to-slate-950 shadow-md hover:shadow-lg"
                        }`}
                    >
                      {isConnected(user.id)
                        ? "✓ Connected"
                        : hasPendingRequest(user.id)
                          ? "⏳ Request Sent"
                          : "Connect"
                      }
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-4 py-2 rounded-lg transition-colors ${currentPage === page
                          ? "bg-slate-800 text-white"
                          : "border border-gray-300 hover:bg-gray-50"
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}

              <div className="mt-4 text-center text-sm text-gray-600">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} approved fellows
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FellowsPage;