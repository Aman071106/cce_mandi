"use client";

import React, { useEffect, useState, useContext } from "react";
import { fetchAllUsers, fetchCourses, sendConnectionRequest, getConnections, getConnectionRequests, acceptConnectionRequest, rejectConnectionRequest } from "@/lib/actions";
import { UserContext } from "@/context/user-context";
import toast from "react-hot-toast";
import { Users, RefreshCw, Search, Mail, Phone, Linkedin, MessageCircle, Filter, ChevronLeft, ChevronRight, Check, X } from "lucide-react";

const INDUSTRIES = [
  "AI and Data Science",
  "Computer Vision",
  "NLP",
  "Machine Learning",
  "Generative AI"
];

const ITEMS_PER_PAGE = 12; // 4x3 grid

const FellowsPage = () => {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [connections, setConnections] = useState<any[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const { currentUserID } = useContext(UserContext);

  const loadAllUsers = async () => {
    try {
      setRefreshing(true);
      const users = await fetchAllUsers();
      // Filter out current user
      const filteredUsers = users.filter(user => user.id !== currentUserID);
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

  // Apply filters
  useEffect(() => {
    let filtered = [...allUsers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.personalDetails?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.connectionDetails?.emailAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.employmentDetails?.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Course filter
    if (selectedCourses.length > 0) {
      filtered = filtered.filter(user =>
        user.selectedCourses?.some((course: string) => selectedCourses.includes(course))
      );
    }

    // Industry filter
    if (selectedIndustries.length > 0) {
      filtered = filtered.filter(user =>
        selectedIndustries.includes(user.employmentDetails?.industry)
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, selectedCourses, selectedIndustries, allUsers]);

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
  };

  const handleConnect = async (userId: string) => {
    if (!currentUserID) {
      toast.error("Please login to connect");
      return;
    }

    // Check if already connected
    const isConnected = connections.some(
      conn => conn.status === "accepted" &&
        ((conn.fromUserId === currentUserID && conn.toUserId === userId) ||
          (conn.fromUserId === userId && conn.toUserId === currentUserID))
    );

    if (isConnected) {
      toast.error("Already connected");
      return;
    }

    // Check if request already sent
    const requestSent = connections.some(
      conn => conn.status === "pending" &&
        conn.fromUserId === currentUserID &&
        conn.toUserId === userId
    );

    if (requestSent) {
      toast.error("Connection request already sent");
      return;
    }

    // Check if there's a pending request from the other user
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

  // Pagination
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

  const isConnected = (userId: string) => {
    return connections.some(
      conn => conn.status === "accepted" &&
        ((conn.fromUserId === currentUserID && conn.toUserId === userId) ||
          (conn.fromUserId === userId && conn.toUserId === currentUserID))
    );
  };
  const hasPendingRequest = (userId: string) => {
    return connections.some(
      conn => conn.status === "pending" &&
        conn.fromUserId === currentUserID &&
        conn.toUserId === userId
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-12 mt-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fellows Directory</h1>
            <p className="text-gray-600 mt-1">Connect with approved members ({filteredUsers.length} fellows)</p>
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
                  placeholder="Search by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                />
              </div>
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

            {/* Filter Panel */}
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

                {(selectedCourses.length > 0 || selectedIndustries.length > 0) && (
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
              {searchTerm || selectedCourses.length > 0 || selectedIndustries.length > 0
                ? "No fellows match your search criteria"
                : "No approved fellows found"}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentUsers.map(user => (
                  <div key={user.id} className="bg-slate-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex-1 mb-4">
                      <h3 className="font-semibold text-gray-800 text-lg mb-1">
                        {displayValue(user.personalDetails?.fullName)}
                      </h3>
                      <p className="text-sm text-gray-700 font-medium">
                        {displayValue(user.employmentDetails?.company)}
                      </p>
                      {user.employmentDetails?.industry && (
                        <p className="text-xs text-gray-500 mt-1">
                          {user.employmentDetails.industry}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={14} className="text-slate-500 flex-shrink-0" />
                        <span className="truncate">{displayValue(user.connectionDetails?.emailAddress)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone size={14} className="text-slate-500 flex-shrink-0" />
                        <span>{displayValue(user.connectionDetails?.contactNumber)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <Linkedin size={14} className="text-slate-500 flex-shrink-0" />
                        <span>
                          {user.connectionDetails?.linkedIn ? (
                            <a
                              href={user.connectionDetails.linkedIn}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline truncate"
                            >
                              Profile
                            </a>
                          ) : (
                            "—"
                          )}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleConnect(user.id)}
                      disabled={isConnected(user.id) || hasPendingRequest(user.id)}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${isConnected(user.id)
                          ? "bg-green-600 text-white cursor-not-allowed"
                          : hasPendingRequest(user.id)
                            ? "bg-amber-500 text-white cursor-not-allowed"
                            : "bg-slate-800 text-white hover:bg-slate-900"
                        }`}
                    >
                      <MessageCircle size={16} />
                      {isConnected(user.id)
                        ? "Connected"
                        : hasPendingRequest(user.id)
                          ? "Request Sent"
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
                Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} fellows
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FellowsPage;
