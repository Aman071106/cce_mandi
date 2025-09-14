"use client";

import React, { useEffect, useState } from "react";
import { fetchPendingUsers, approveUser, rejectUser, deleteUser, fetchCourses, addCourse } from "@/lib/actions";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, X, Plus, Users, BookOpen, RefreshCw, Trash2, ChevronDown, ChevronUp, Search } from "lucide-react";

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newCourseName, setNewCourseName] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState<{[key: string]: boolean}>({});
  const [searchTerm, setSearchTerm] = useState("");

  const adminEmail = "aman07112006@gmail.com";

  const loadUsers = async () => {
    try {
      setRefreshing(true);
      const users = await fetchPendingUsers();
      const filteredUsers = users.filter(user => user.connectionDetails?.emailAddress !== adminEmail);
      setPendingUsers(filteredUsers);
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
      toast.error("Failed to fetch courses");
      console.error(e);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadUsers();
    loadCourses();
  }, []);

  const handleApprove = async (userID: string) => {
    try {
      await approveUser(userID);
      toast.success("User approved successfully");
      loadUsers();
    } catch (error) {
      toast.error("Failed to approve user");
    }
  };

  const handleReject = async (userID: string) => {
    try {
      await rejectUser(userID);
      toast.success("User rejected successfully");
      loadUsers();
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

  const toggleUserExpansion = (userId: string) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const filteredUsers = pendingUsers.filter(user => 
    user.personalDetails?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.connectionDetails?.emailAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.personalDetails?.enrollmentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-12 mt-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage users and courses</p>
          </div>
          <button
            onClick={() => {
              setLoading(true);
              loadUsers();
              loadCourses();
            }}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>

        {/* Pending Users Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
              <Users size={24} className="text-slate-700" />
              <h2 className="text-2xl font-semibold text-gray-800">User Management</h2>
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
              {filteredUsers.map(user => (
                <div key={user.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => toggleUserExpansion(user.id)}>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">
                        {user.personalDetails?.fullName || "Unnamed User"}
                      </p>
                      <p className="text-gray-500 text-sm truncate">
                        {user.connectionDetails?.emailAddress}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <StatusBadge status={user.status} />
                      {expandedUsers[user.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                  
                  {expandedUsers[user.id] && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Personal Details</h3>
                          <p className="text-gray-800"><strong>Enrollment:</strong> {user.personalDetails?.enrollmentNumber || "Not provided"}</p>
                          <p className="text-gray-800"><strong>Age:</strong> {user.personalDetails?.age || "Not provided"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Employment Details</h3>
                          <p className="text-gray-800"><strong>Company:</strong> {user.employmentDetails?.company || "Not provided"}</p>
                          <p className="text-gray-800"><strong>Industry:</strong> {user.employmentDetails?.industry || "Not provided"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Connection Details</h3>
                          <p className="text-gray-800"><strong>LinkedIn:</strong> {user.connectionDetails?.linkedIn  || "Not provided"}</p>
                          <p className="text-gray-800"><strong>Email:</strong> {user.connectionDetails?.emailAddress || "Not provided"}</p>
                          <p className="text-gray-800"><strong>Contact Number:</strong> {user.connectionDetails?.contactNumber|| "Not provided"}</p>
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
                  <div key={course.id} className="p-4 bg-slate-50 border border-gray-200 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800">{course.courseName}</h4>
                      <span className="text-sm font-mono text-slate-600 bg-slate-200 px-2 py-1 rounded">
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
      </div>
    </div>
  );
};

export default AdminDashboard;