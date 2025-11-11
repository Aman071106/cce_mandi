"use client";

import React, { useEffect, useState } from "react";
import { fetchAllUsers, fetchCourses } from "@/lib/actions";
import toast from "react-hot-toast";
import { Users, RefreshCw, Search, Mail, Phone, Linkedin, User, MessageCircle, Filter } from "lucide-react";

const FellowsPage = () => {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const loadAllUsers = async () => {
    try {
      setRefreshing(true);
      const users = await fetchAllUsers();
      setAllUsers(users);
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

  useEffect(() => {
    setLoading(true);
    loadAllUsers();
    loadCourses();
  }, []);

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = 
      user.personalDetails?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.connectionDetails?.emailAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employmentDetails?.company?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse = selectedCourse ? 
      user.selectedCourses?.includes(selectedCourse) : true;

    return matchesSearch && matchesCourse;
  });

  const handleConnect = (user: any) => {
    toast.success(`Connecting with ${user.personalDetails?.fullName || "User"}!`);
    console.log("Connecting with user:", user);
  };

  // Helper function to display value or "—"
  const displayValue = (value: string | undefined | null) => {
    return value ? value : "—";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-12 mt-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fellows Directory</h1>
            <p className="text-gray-600 mt-1">Connect with fellow members</p>
          </div>
          <button
            onClick={loadAllUsers}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
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
            <div className="relative w-full md:w-64">
              <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.courseName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Users Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || selectedCourse ? "No fellows match your search" : "No fellows found"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredUsers.map(user => (
                <div key={user.id} className="bg-slate-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  {/* User Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg mb-1">
                        {displayValue(user.personalDetails?.fullName)}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Enrollment: {displayValue(user.personalDetails?.enrollmentNumber)}
                      </p>
                      <p className="text-sm text-gray-700 font-medium">
                        Company: {displayValue(user.employmentDetails?.company)}
                      </p>
                    </div>
                  </div>

                  {/* Connection Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Mail size={16} className="text-slate-500" />
                      <span className="truncate">{displayValue(user.connectionDetails?.emailAddress)}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Phone size={16} className="text-slate-500" />
                      <span>{displayValue(user.connectionDetails?.contactNumber)}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Linkedin size={16} className="text-slate-500" />
                      <span>
                        {user.connectionDetails?.linkedIn ? (
                          <a 
                            href={user.connectionDetails.linkedIn} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate"
                          >
                            View Profile
                          </a>
                        ) : (
                          "—"
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Connect Button */}
                  <button 
                    onClick={() => handleConnect(user)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium"
                  >
                    <MessageCircle size={18} />
                    Connect
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FellowsPage;