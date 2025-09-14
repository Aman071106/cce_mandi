"use client";

import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "@/context/user-context";
import { useRouter } from "next/navigation";
import { getUserDoc, updateUserDoc,fetchCourses,registerCourse } from "@/lib/actions";
import toast from "react-hot-toast";
import { User, Mail, Phone, Briefcase, MapPin, Linkedin, Edit3, Save, X, Shield, Clock, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";

const ProfileCard = () => {
  const [courses, setCourses] = useState<any[]>([]);
const [loadingCourses, setLoadingCourses] = useState(true);

useEffect(() => {
  const fetchAllCourses = async () => {
    try {
      const allCourses = await fetchCourses();
      setCourses(allCourses);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch courses");
    } finally {
      setLoadingCourses(false);
    }
  };
  fetchAllCourses();
}, []);

  const { currentUserID } = useContext(UserContext);
  const router = useRouter();
  const [userData, setUserData] = useState<any>({});
  const [editableData, setEditableData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUserID) {
      router.push("/");
      return;
    }
    (async () => {
      try {
        const data = await getUserDoc(currentUserID);
        setUserData(data);
        setEditableData(data);
      } catch (e) {
        console.error(e);
        router.push("/");
      }
    })();
  }, [currentUserID]);

  const handleChange = (section: string, key: string, value: string) => {
    setEditableData((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const handleSave = async () => {
    try {
      await updateUserDoc(currentUserID!, editableData);
      setUserData(editableData);
      setIsEditing(false);
      setActiveSection(null);
      // toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const openEditSection = (section: string) => {
    setActiveSection(section);
    setIsEditing(true);
  };

  const closeEditModal = () => {
    setIsEditing(false);
    setActiveSection(null);
    setEditableData(userData);
  };

  // Status badge component with appropriate colors
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      pending: {
        bgColor: "bg-amber-100",
        textColor: "text-amber-800",
        borderColor: "border-amber-200",
        icon: <Clock size={14} />,
        label: "Pending Review"
      },
      approved: {
        bgColor: "bg-emerald-100",
        textColor: "text-emerald-800",
        borderColor: "border-emerald-200",
        icon: <CheckCircle size={14} />,
        label: "Approved"
      },
      rejected: {
        bgColor: "bg-rose-100",
        textColor: "text-rose-800",
        borderColor: "border-rose-200",
        icon: <XCircle size={14} />,
        label: "Rejected"
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${config.bgColor} ${config.textColor} border ${config.borderColor} text-sm font-medium`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const renderEditModal = () => {
    if (!activeSection) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h3 className="text-xl font-semibold text-gray-800 capitalize">
              Edit {activeSection.replace(/([A-Z])/g, ' $1')}
            </h3>
            <button 
              onClick={closeEditModal}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6">
            {activeSection === "personalDetails" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enrollment Number
                  </label>
                  <input
                    type="text"
                    value={editableData.personalDetails?.enrollmentNumber || ""}
                    onChange={(e) =>
                      handleChange("personalDetails", "enrollmentNumber", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editableData.personalDetails?.fullName || ""}
                    onChange={(e) =>
                      handleChange("personalDetails", "fullName", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={editableData.personalDetails?.age || ""}
                    onChange={(e) =>
                      handleChange("personalDetails", "age", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
            
            {activeSection === "employmentDetails" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={editableData.employmentDetails?.company || ""}
                    onChange={(e) =>
                      handleChange("employmentDetails", "company", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={editableData.employmentDetails?.industry || ""}
                    onChange={(e) =>
                      handleChange("employmentDetails", "industry", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editableData.employmentDetails?.location || ""}
                    onChange={(e) =>
                      handleChange("employmentDetails", "location", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
            
            {activeSection === "connectionDetails" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn Profile
                  </label>
                  <input
                    type="text"
                    value={editableData.connectionDetails?.linkedIn || ""}
                    onChange={(e) =>
                      handleChange("connectionDetails", "linkedIn", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    value={editableData.connectionDetails?.contactNumber || ""}
                    onChange={(e) =>
                      handleChange("connectionDetails", "contactNumber", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600">
                    <Mail size={18} className="mr-2" />
                    {userData.connectionDetails?.emailAddress || "No email provided"}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>
            )}
           

          </div>
          
          <div className="flex justify-end gap-3 p-6 border-t">
            <button
              onClick={closeEditModal}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors flex items-center"
            >
              <Save size={18} className="mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          {/* Profile Header with Cover Image */}
          <div className="relative h-48 bg-gradient-to-r from-slate-800 to-gray-900">
            <div className="absolute bottom-0 left-8 transform translate-y-1/2">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                  {userData.personalDetails?.profileImage ? (
                    <Image
                      src={userData.personalDetails.profileImage}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <User size={64} className="text-slate-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-20 pb-8 px-8">
            <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {userData.personalDetails?.fullName || "No Name Provided"}
                  </h1>
                  {userData.status && <StatusBadge status={userData.status} />}
                </div>
                <p className="text-gray-600">
                  {userData.employmentDetails?.company 
                    ? `${userData.employmentDetails.company} • ${userData.employmentDetails.industry}` 
                    : "Employment information not provided"}
                </p>
              </div>
              <button 
                onClick={() => openEditSection("personalDetails")}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors shadow-sm"
              >
                <Edit3 size={18} />
                Update Profile
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Details Card */}
              <div className="bg-slate-50 rounded-xl p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <User size={20} className="text-slate-600" />
                    Personal Details
                  </h2>
                  <button 
                    onClick={() => openEditSection("personalDetails")}
                    className="text-slate-600 hover:text-slate-800 transition-colors p-1 rounded hover:bg-slate-200"
                  >
                    <Edit3 size={18} />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Enrollment Number</p>
                    <p className="text-gray-800 font-medium">
                      {userData.personalDetails?.enrollmentNumber || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Age</p>
                    <p className="text-gray-800 font-medium">
                      {userData.personalDetails?.age ? `${userData.personalDetails.age} years` : "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Employment Details Card */}
              <div className="bg-slate-50 rounded-xl p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Briefcase size={20} className="text-slate-600" />
                    Employment Details
                  </h2>
                  <button 
                    onClick={() => openEditSection("employmentDetails")}
                    className="text-slate-600 hover:text-slate-800 transition-colors p-1 rounded hover:bg-slate-200"
                  >
                    <Edit3 size={18} />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Company</p>
                    <p className="text-gray-800 font-medium">
                      {userData.employmentDetails?.company || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Industry</p>
                    <p className="text-gray-800 font-medium">
                      {userData.employmentDetails?.industry || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Location</p>
                    <p className="text-gray-800 font-medium flex items-center gap-1">
                      <MapPin size={16} className="text-gray-500" />
                      {userData.employmentDetails?.location || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Connection Details Card */}
              <div className="bg-slate-50 rounded-xl p-6 border border-gray-100 md:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Phone size={20} className="text-slate-600" />
                    Connection Details
                  </h2>
                  <button 
                    onClick={() => openEditSection("connectionDetails")}
                    className="text-slate-600 hover:text-slate-800 transition-colors p-1 rounded hover:bg-slate-200"
                  >
                    <Edit3 size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email Address</p>
                    <p className="text-gray-800 font-medium flex items-center gap-1">
                      <Mail size={16} className="text-gray-500" />
                      {userData.connectionDetails?.emailAddress || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Contact Number</p>
                    <p className="text-gray-800 font-medium">
                      {userData.connectionDetails?.contactNumber || "Not provided"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 mb-1">LinkedIn Profile</p>
                    {userData.connectionDetails?.linkedIn ? (
                      <a 
                        href={userData.connectionDetails.linkedIn} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-slate-700 hover:text-slate-900 hover:underline flex items-center gap-1 font-medium"
                      >
                        {/* <Linkedin size={16} /> */}
                        {userData.connectionDetails.linkedIn}
                      </a>
                    ) : (
                      <p className="text-gray-800 font-medium">Not provided</p>
                    )}
                  </div>
                </div>
              </div>
               {/* Courses Registration Card */}
<div className="bg-slate-50 rounded-xl p-6 border border-gray-100 md:col-span-2">
  <h2 className="text-xl font-semibold text-gray-800 mb-4">Register for Courses</h2>

  {loadingCourses ? (
    <p>Loading courses...</p>
  ) : (
    <div className="space-y-3">
      {courses.map(course => {
        const isRegistered = course.enrolledEmails?.includes(userData.connectionDetails?.emailAddress);

        return (
          <div key={course.id} className="flex justify-between items-center p-3 border rounded-lg">
            <div>
              <p className="font-medium text-gray-800">{course.courseName}</p>
              <p className="text-sm text-gray-500">{course.id}</p>
            </div>
            <button
              disabled={isRegistered}
              onClick={async () => {
                try {
                  await registerCourse(course.id, userData.connectionDetails.emailAddress);
                  // update local state so UI shows registration immediately
                  setCourses(prev => prev.map(c => 
                    c.id === course.id 
                      ? { ...c, enrolledEmails: [...(c.enrolledEmails || []), userData.connectionDetails.emailAddress] }
                      : c
                  ));
                } catch (err) {
                  console.error(err);
                  toast.error("Failed to register");
                }
              }}
              className={`px-4 py-2 rounded-lg text-white transition-colors ${
                isRegistered ? "bg-gray-400 cursor-not-allowed" : "bg-slate-800 hover:bg-slate-900"
              }`}
            >
              {isRegistered ? "Registered" : "Register"}
            </button>
          </div>
        )
      })}
    </div>
  )}
</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Modal */}
      {isEditing && renderEditModal()}
    </div>
  );
};

export default ProfileCard;