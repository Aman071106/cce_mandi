"use client";

import React, { useEffect, useState } from "react";
import {
  fetchPendingUsers,
  approveUser,
  rejectUser,
  deleteUser,
  fetchCourses,
  addCourse,
  fetchAllUsersForAdmin,
  bulkApproveUsers,
  bulkRejectUsers,
  fetchIndustries,
  addIndustry,
  deleteIndustry,
  deleteCourse
} from "@/lib/actions";
import toast from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  X,
  Plus,
  Users,
  BookOpen,
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  Hash,
  Download,
  CheckSquare,
  Square,
  Check,
  Briefcase
} from "lucide-react";

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [industries, setIndustries] = useState<any[]>([]);
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newCourseName, setNewCourseName] = useState("");
  const [newIndustryName, setNewIndustryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState("");

  // New state for download list and bulk actions
  const [showDownloadList, setShowDownloadList] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // Separate selected users for pending view and download list view
  const [selectedPendingUsers, setSelectedPendingUsers] = useState<string[]>([]);
  const [selectedAllUsers, setSelectedAllUsers] = useState<string[]>([]);

  const [selectAllPending, setSelectAllPending] = useState(false);
  const [selectAllUsers, setSelectAllUsers] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const adminEmails = ["cce19112025@gmail.com", "aakashgautam@iitmandi.ac.in", "cceoffice@iitmandi.ac.in"];

  const loadUsers = async () => {
    try {
      setRefreshing(true);
      const users = await fetchPendingUsers();
      const filteredUsers = users.filter(user => !adminEmails.includes(user.connectionDetails?.emailAddress));
      setPendingUsers(filteredUsers);
    } catch (e) {
      toast.error("Failed to fetch users");
      console.error(e);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    try {
      const users = await fetchAllUsersForAdmin();
      // Filter out admin user
      const filteredUsers = users.filter(user => !adminEmails.includes(user.connectionDetails?.emailAddress));
      setAllUsers(filteredUsers);
    } catch (error) {
      console.error("Error loading all users:", error);
      toast.error("Failed to load user list");
    }
  };

  const loadCourses = async () => {
    try {
      const courseList = await fetchCourses();
      setCourses(courseList);
    } catch (e) {
      toast.error("Failed to fetch courses");
      console.error(e);
    }
  };

  const loadIndustries = async () => {
    try {
      const industryList = await fetchIndustries();
      setIndustries(industryList);
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch industries");
    }
  };

  useEffect(() => {
    setLoading(true);
    loadUsers();
    loadCourses();
    loadIndustries();
    loadAllUsers(); // Load all users on mount
  }, []);

  // Handle individual user selection in pending view
  const handleSelectPendingUser = (userId: string) => {
    setSelectedPendingUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Handle individual user selection in download list view
  const handleSelectAllUser = (userId: string) => {
    setSelectedAllUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Handle select all in pending view
  const handleSelectAllPending = () => {
    if (selectAllPending) {
      setSelectedPendingUsers([]);
    } else {
      const allPendingUserIds = pendingUsers.map(user => user.id);
      setSelectedPendingUsers(allPendingUserIds);
    }
    setSelectAllPending(!selectAllPending);
  };

  // Handle select all in download list view
  const handleSelectAllUsers = () => {
    if (selectAllUsers) {
      setSelectedAllUsers([]);
    } else {
      const allUserIds = allUsers.map(user => user.id);
      setSelectedAllUsers(allUserIds);
    }
    setSelectAllUsers(!selectAllUsers);
  };

  // Bulk approve selected pending users
  const handleBulkApprovePending = async () => {
    if (selectedPendingUsers.length === 0) {
      toast.error("Please select users to approve");
      return;
    }

    if (!confirm(`Are you sure you want to approve ${selectedPendingUsers.length} pending user(s)?`)) {
      return;
    }

    try {
      const success = await bulkApproveUsers(selectedPendingUsers);
      if (success) {
        setSelectedPendingUsers([]);
        setSelectAllPending(false);
        loadUsers(); // Refresh pending users
        loadAllUsers(); // Refresh all users list
      }
    } catch (error) {
      console.error("Error in bulk approve:", error);
    }
  };

  // Bulk reject selected pending users
  const handleBulkRejectPending = async () => {
    if (selectedPendingUsers.length === 0) {
      toast.error("Please select users to reject");
      return;
    }

    if (!confirm(`Are you sure you want to reject ${selectedPendingUsers.length} pending user(s)?`)) {
      return;
    }

    try {
      const success = await bulkRejectUsers(selectedPendingUsers);
      if (success) {
        setSelectedPendingUsers([]);
        setSelectAllPending(false);
        loadUsers(); // Refresh pending users
        loadAllUsers(); // Refresh all users list
      }
    } catch (error) {
      console.error("Error in bulk reject:", error);
    }
  };

  // Bulk approve selected users from download list
  const handleBulkApproveAll = async () => {
    if (selectedAllUsers.length === 0) {
      toast.error("Please select users to approve");
      return;
    }

    if (!confirm(`Are you sure you want to approve ${selectedAllUsers.length} user(s)?`)) {
      return;
    }

    try {
      const success = await bulkApproveUsers(selectedAllUsers);
      if (success) {
        setSelectedAllUsers([]);
        setSelectAllUsers(false);
        loadUsers(); // Refresh pending users
        loadAllUsers(); // Refresh all users list
      }
    } catch (error) {
      console.error("Error in bulk approve:", error);
    }
  };

  // Bulk reject selected users from download list
  const handleBulkRejectAll = async () => {
    if (selectedAllUsers.length === 0) {
      toast.error("Please select users to reject");
      return;
    }

    if (!confirm(`Are you sure you want to reject ${selectedAllUsers.length} user(s)?`)) {
      return;
    }

    try {
      const success = await bulkRejectUsers(selectedAllUsers);
      if (success) {
        setSelectedAllUsers([]);
        setSelectAllUsers(false);
        loadUsers(); // Refresh pending users
        loadAllUsers(); // Refresh all users list
      }
    } catch (error) {
      console.error("Error in bulk reject:", error);
    }
  };

  // Download CSV function
  const downloadCSV = () => {
    if (downloading) return;

    setDownloading(true);
    try {
      // Create CSV headers
      const headers = [
        "Enrollment No",
        "Name",
        "Email",
        "Gender",
        "Age",
        "Status",
        "Course",
        "Course Registration No",
        "Company",
        "Location",
        "Contact Number",
        "LinkedIn",
        "Profile Submitted",
        "Submission Date"
      ];

      // Create CSV rows
      const rows = allUsers.map(user => {
        // Get course registrations as comma-separated strings
        const courses = user.courseRegistrations?.map((reg: any) => reg.courseCode).join(", ") || "";
        const regNumbers = user.courseRegistrations?.map((reg: any) => reg.registrationNumber).join(", ") || "";

        // Format date
        const submissionDate = user.submissionDate
          ? new Date(user.submissionDate.toDate()).toLocaleDateString()
          : "";

        return [
          user.personalDetails?.enrollmentNumber || "",
          user.personalDetails?.fullName || "",
          user.connectionDetails?.emailAddress || user.email || "",
          user.personalDetails?.gender || "",
          user.personalDetails?.age || "",
          user.status || "",
          courses,
          regNumbers,
          user.employmentDetails?.company || "",
          user.employmentDetails?.location || "",
          user.connectionDetails?.contactNumber || "",
          user.connectionDetails?.linkedIn || "",
          user.profileSubmitted ? "Yes" : "No",
          submissionDate
        ].map(field => `"${field}"`).join(",");
      });

      // Combine headers and rows
      const csvContent = [headers.join(","), ...rows].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV downloaded successfully!");
    } catch (error) {
      console.error("Error downloading CSV:", error);
      toast.error("Failed to download CSV");
    } finally {
      setDownloading(false);
    }
  };

  const handleApprove = async (userID: string) => {
    try {
      await approveUser(userID);
      toast.success("User approved successfully");
      loadUsers();
      loadAllUsers();
    } catch (error) {
      toast.error("Failed to approve user");
    }
  };

  const handleReject = async (userID: string) => {
    try {
      await rejectUser(userID);
      toast.success("User rejected successfully");
      loadUsers();
      loadAllUsers();
    } catch (error) {
      toast.error("Failed to reject user");
    }
  };

  const handleDelete = async (userID: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      await deleteUser(userID);
      toast.success("User deleted successfully");
      loadUsers();
      loadAllUsers();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleAddCourse = async () => {
    if (!newCourseCode.trim() || !newCourseName.trim()) {
      return toast.error("Please fill both course code and name");
    }

    try {
      await addCourse(newCourseCode, newCourseName);
      setNewCourseCode("");
      setNewCourseName("");
      toast.success("Course added successfully");
      loadCourses();
    } catch (error) {
      toast.error("Failed to add course");
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course? This cannot be undone.")) return;

    try {
      await deleteCourse(courseId);
      toast.success("Course deleted successfully");
      loadCourses();
    } catch (error) {
      toast.error("Failed to delete course");
    }
  };

  const handleAddIndustry = async () => {
    if (!newIndustryName.trim()) {
      return toast.error("Please enter industry name");
    }
    try {
      await addIndustry(newIndustryName);
      setNewIndustryName("");
      toast.success("Industry added");
      loadIndustries();
    } catch (error) {
      toast.error("Failed to add industry");
    }
  };

  const handleDeleteIndustry = async (id: string) => {
    if (!confirm("Delete this industry?")) return;
    try {
      await deleteIndustry(id);
      toast.success("Industry deleted");
      loadIndustries();
    } catch (error) {
      toast.error("Failed to delete industry");
    }
  };

  const toggleUserExpansion = (userId: string) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // Filter functions
  const filteredUsers = pendingUsers.filter(user =>
    user.personalDetails?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.connectionDetails?.emailAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.personalDetails?.enrollmentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAllUsers = allUsers.filter(user =>
    user.personalDetails?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.connectionDetails?.emailAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.personalDetails?.enrollmentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: JSX.Element }> = {
      pending: {
        bg: "bg-amber-100",
        text: "text-amber-800",
        icon: <XCircle size={14} />
      },
      approved: {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        icon: <CheckCircle size={14} />
      },
      rejected: {
        bg: "bg-rose-100",
        text: "text-rose-800",
        icon: <XCircle size={14} />
      },
    };

    const badge = statusConfig[status] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      icon: <XCircle size={14} />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${badge.bg} ${badge.text} text-sm font-medium`}>
        {badge.icon} {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="no-scrollbar min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-12 mt-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage users and courses</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowDownloadList(!showDownloadList);
                if (!showDownloadList) {
                  loadAllUsers();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={18} />
              {showDownloadList ? "Hide User List" : "Download User List"}
            </button>
            <button
              onClick={() => {
                setLoading(true);
                loadUsers();
                loadCourses();
                loadAllUsers();
              }}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
        </div>

        {/* Bulk Actions Bar for Pending Users (shown only in normal mode) */}
        {!showDownloadList && selectedPendingUsers.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4 border border-blue-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Check size={20} className="text-blue-600" />
                <span className="font-semibold text-gray-800">
                  {selectedPendingUsers.length} pending user(s) selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleBulkApprovePending}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <CheckCircle size={16} />
                  Approve Selected
                </button>
                <button
                  onClick={handleBulkRejectPending}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  <XCircle size={16} />
                  Reject Selected
                </button>
                <button
                  onClick={() => {
                    setSelectedPendingUsers([]);
                    setSelectAllPending(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X size={16} />
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions Bar for Download List (shown only in download list mode) */}
        {showDownloadList && selectedAllUsers.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4 border border-blue-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Check size={20} className="text-blue-600" />
                <span className="font-semibold text-gray-800">
                  {selectedAllUsers.length} user(s) selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleBulkApproveAll}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <CheckCircle size={16} />
                  Approve Selected
                </button>
                <button
                  onClick={handleBulkRejectAll}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  <XCircle size={16} />
                  Reject Selected
                </button>
                <button
                  onClick={() => {
                    setSelectedAllUsers([]);
                    setSelectAllUsers(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X size={16} />
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Download List Section */}
        {showDownloadList && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="flex items-center gap-3">
                <Users size={24} className="text-blue-700" />
                <h2 className="text-2xl font-semibold text-gray-800">All Users List (Excluding Draft Users)</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {allUsers.length} total users
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative w-full sm:w-64">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={downloadCSV}
                  disabled={downloading || allUsers.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Download size={18} className={downloading ? "animate-spin" : ""} />
                  {downloading ? "Downloading..." : "Download CSV"}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredAllUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "No users match your search" : "No users found"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-3 text-left">
                        <button
                          onClick={handleSelectAllUsers}
                          className="flex items-center gap-2"
                        >
                          {selectAllUsers ? (
                            <CheckSquare size={18} className="text-blue-600" />
                          ) : (
                            <Square size={18} className="text-gray-400" />
                          )}
                          <span className="text-sm font-medium text-gray-700">Select</span>
                        </button>
                      </th>
                      <th className="p-3 text-left text-sm font-medium text-gray-700">Enrollment No</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-700">Name</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-700">Email</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-700">Gender</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-700">Age</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-700">Courses</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-700">Reg Numbers</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAllUsers.map(user => (
                      <tr
                        key={user.id}
                        className={`hover:bg-gray-50 ${selectedAllUsers.includes(user.id) ? 'bg-blue-50' : ''}`}
                      >
                        <td className="p-3">
                          <button
                            onClick={() => handleSelectAllUser(user.id)}
                            className="flex items-center justify-center"
                          >
                            {selectedAllUsers.includes(user.id) ? (
                              <CheckSquare size={18} className="text-blue-600" />
                            ) : (
                              <Square size={18} className="text-gray-400 hover:text-gray-600" />
                            )}
                          </button>
                        </td>
                        <td className="p-3 text-sm text-gray-800 font-mono">
                          {user.personalDetails?.enrollmentNumber || "N/A"}
                        </td>
                        <td className="p-3 text-sm font-medium text-gray-800">
                          {user.personalDetails?.fullName || "Unnamed"}
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {user.connectionDetails?.emailAddress || user.email}
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {user.personalDetails?.gender || "N/A"}
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {user.personalDetails?.age || "N/A"}
                        </td>
                        <td className="p-3">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {user.courseRegistrations?.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {user.courseRegistrations.map((reg: any, index: number) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {reg.courseCode}
                                </span>
                              ))}
                            </div>
                          ) : (
                            "No courses"
                          )}
                        </td>
                        <td className="p-3 text-sm text-gray-600 font-mono">
                          {user.courseRegistrations?.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {user.courseRegistrations.map((reg: any, index: number) => (
                                <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  {reg.registrationNumber}
                                </span>
                              ))}
                            </div>
                          ) : (
                            "N/A"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Original Pending Users Section (shown when not in download list mode) */}
        {!showDownloadList && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="flex items-center gap-3">
                <Users size={24} className="text-slate-700" />
                <h2 className="text-2xl font-semibold text-gray-800">User Management</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {pendingUsers.length} pending users
                </span>
              </div>

              <div className="relative w-full md:w-64">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "No users match your search" : "No pending users"}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Bulk selection header for pending users */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSelectAllPending}
                      className="flex items-center gap-2"
                    >
                      {selectAllPending ? (
                        <CheckSquare size={18} className="text-blue-600" />
                      ) : (
                        <Square size={18} className="text-gray-400" />
                      )}
                      <span className="text-sm font-medium text-gray-700">Select All Pending Users</span>
                    </button>
                    {selectedPendingUsers.length > 0 && (
                      <span className="text-sm text-gray-600 ml-auto">
                        {selectedPendingUsers.length} selected
                      </span>
                    )}
                  </div>
                </div>

                {filteredUsers.map(user => (
                  <div key={user.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleSelectPendingUser(user.id)}
                          className="flex items-center justify-center"
                        >
                          {selectedPendingUsers.includes(user.id) ? (
                            <CheckSquare size={18} className="text-blue-600" />
                          ) : (
                            <Square size={18} className="text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => toggleUserExpansion(user.id)}
                        >
                          <p className="font-semibold text-gray-800 truncate">
                            {user.personalDetails?.fullName || "Unnamed User"}
                          </p>
                          <p className="text-gray-500 text-sm truncate">
                            {user.connectionDetails?.emailAddress}
                          </p>
                          {/* Show course count and registration numbers in collapsed view */}
                          {user.courseRegistrations && user.courseRegistrations.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {user.courseRegistrations.slice(0, 2).map((reg: any, index: number) => (
                                <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  <Hash size={10} />
                                  {reg.courseCode}: {reg.registrationNumber}
                                </span>
                              ))}
                              {user.courseRegistrations.length > 2 && (
                                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  +{user.courseRegistrations.length - 2} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <StatusBadge status={user.status} />
                        <button
                          onClick={() => toggleUserExpansion(user.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {expandedUsers[user.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </div>

                    {expandedUsers[user.id] && (
                      <div className="p-4 bg-white border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Personal Details</h3>
                            <p className="text-gray-800"><strong>Enrollment:</strong> {user.personalDetails?.enrollmentNumber || "Not provided"}</p>
                            <p className="text-gray-800"><strong>Age:</strong> {user.personalDetails?.age || "Not provided"}</p>
                            <p className="text-gray-800"><strong>Gender:</strong> {user.personalDetails?.gender || "Not provided"}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Employment Details</h3>
                            <p className="text-gray-800"><strong>Status:</strong> {user.employmentDetails?.employmentStatus || "Not provided"}</p>
                            <p className="text-gray-800"><strong>Company:</strong> {user.employmentDetails?.company || "Not provided"}</p>
                            <p className="text-gray-800"><strong>Industry:</strong> {user.employmentDetails?.industry || "Not provided"}</p>
                            <p className="text-gray-800"><strong>Location:</strong> {user.employmentDetails?.location || "Not provided"}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Connection Details</h3>
                            <p className="text-gray-800"><strong>LinkedIn:</strong> {user.connectionDetails?.linkedIn || "Not provided"}</p>
                            <p className="text-gray-800"><strong>Email:</strong> {user.connectionDetails?.emailAddress || "Not provided"}</p>
                            <p className="text-gray-800"><strong>Contact Number:</strong> {user.connectionDetails?.contactNumber || "Not provided"}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Course Registrations</h3>
                            {user.courseRegistrations && user.courseRegistrations.length > 0 ? (
                              <div className="space-y-2">
                                {user.courseRegistrations.map((reg: any, index: number) => (
                                  <div key={index} className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                                    <div>
                                      <p className="font-medium text-sm text-blue-800">{reg.courseCode}</p>
                                      <p className="text-xs text-blue-600">Registration: {reg.registrationNumber}</p>
                                    </div>
                                    <Hash size={16} className="text-blue-500" />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm">No courses registered</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => handleApprove(user.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                          >
                            <CheckCircle size={16} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(user.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                          >
                            <XCircle size={16} />
                            Reject
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Courses Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen size={24} className="text-slate-700" />
            <h2 className="text-2xl font-semibold text-gray-800">Course Management</h2>
          </div>

          {/* Add new course */}
          <div className="bg-slate-50 p-4 rounded-xl mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Add New Course</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Course Code"
                value={newCourseCode}
                onChange={e => setNewCourseCode(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Course Name"
                value={newCourseName}
                onChange={e => setNewCourseName(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
              <button
                onClick={handleAddCourse}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
              >
                <Plus size={18} /> Add Course
              </button>
            </div>
          </div>

          {/* List courses */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Existing Courses</h3>
            {courses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No courses available</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map(course => (
                  <div key={course.id} className="p-4 bg-slate-50 border border-gray-200 rounded-xl group relative">
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="flex justify-between items-start mb-2 pr-8">
                      <h4 className="font-semibold text-gray-800">{course.courseName}</h4>
                      <span className="text-sm text-slate-600 bg-slate-200 px-2 py-1 rounded">
                        {course.id}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      <strong>{course.enrolledEmails?.length || 0}</strong> enrolled
                      {course.enrolledEmails?.length > 0 && (
                        <span className="text-xs text-gray-500 block mt-1">
                          {course.enrolledEmails.slice(0, 3).join(", ")}
                          {course.enrolledEmails.length > 3 && ` and ${course.enrolledEmails.length - 3} more...`}
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Manage Industries Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase size={24} className="text-purple-600" />
            <h2 className="text-2xl font-semibold text-gray-800">Manage Industries</h2>
          </div>

          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="Industry Name"
              value={newIndustryName}
              onChange={(e) => setNewIndustryName(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={handleAddIndustry}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
            >
              <Plus size={20} />
              Add Industry
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {industries.map((industry) => (
              <div
                key={industry.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg group hover:border-purple-200 transition-colors"
              >
                <span className="text-gray-700 font-medium">{industry.name}</span>
                <button
                  onClick={() => handleDeleteIndustry(industry.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {industries.length === 0 && (
              <p className="text-gray-500 text-sm italic">No industries added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;