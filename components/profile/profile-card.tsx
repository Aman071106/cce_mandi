"use client";

import React, { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "@/context/user-context";
import { useRouter } from "next/navigation";
import { getUserDoc, updateUserDoc, fetchCourses, registerCourse, unregisterCourse, submitProfileForApproval, superDeleteUser, uploadProfilePicture, updateUserProfilePicture } from "@/lib/actions";
import toast from "react-hot-toast";
import { User, Mail, Phone, Briefcase, MapPin, Linkedin, Edit3, Save, X, Clock, CheckCircle, XCircle, Send, Trash2, AlertTriangle, Camera } from "lucide-react";
import Image from "next/image";
import { signOutUser } from "@/firebase/firebase";

const INDUSTRIES = [
  "AI and Data Science",
  "Computer Vision",
  "NLP",
  "Machine Learning",
  "Generative AI"
];

const ProfileCard = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const { currentUserID, setCurrentUserID } = useContext(UserContext);
  const router = useRouter();
  const [userData, setUserData] = useState<any>({});
  const [editableData, setEditableData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuperDelete, setShowSuperDelete] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentUserID) {
      router.push("/");
      return;
    }
    loadUserData();
  }, [currentUserID]);

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

  const loadUserData = async () => {
    try {
      const data = await getUserDoc(currentUserID!);
      setUserData(data);
      setEditableData(data);
    } catch (e) {
      console.error(e);
      router.push("/");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const imageUrl = await uploadProfilePicture(file);
      await updateUserProfilePicture(currentUserID!, imageUrl);
      await loadUserData();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleChange = (section: string, key: string, value: string) => {
    setEditableData((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const handleSave = async () => {
    try {
      const linkedInUrl = editableData.connectionDetails?.linkedIn;
      if (linkedInUrl && !linkedInUrl.includes('linkedin.com')) {
        toast.error("Please enter a valid LinkedIn URL");
        return;
      }

      const contactNumber = editableData.connectionDetails?.contactNumber;
      if (contactNumber && !/^\+?\d{10,15}$/.test(contactNumber.replace(/[\s-]/g, ''))) {
        toast.error("Please enter a valid contact number");
        return;
      }

      await updateUserDoc(currentUserID!, editableData);
      setUserData(editableData);
      setIsEditing(false);
      setActiveSection(null);
      await loadUserData();
    } catch (error: any) {
      if (error.message.includes("15 days")) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update profile");
      }
    }
  };

  const handleSubmitForApproval = async () => {
    setIsSubmitting(true);
    try {
      await submitProfileForApproval(currentUserID!);
      await loadUserData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCourseRegistration = async (courseCode: string, isRegistered: boolean) => {
    if (userData.status === "approved" || userData.status === "pending") {
      toast.error("Cannot modify courses after submission");
      return;
    }

    try {
      if (isRegistered) {
        await unregisterCourse(courseCode, currentUserID!);
      } else {
        await registerCourse(courseCode, currentUserID!);
      }
      await loadUserData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update course registration");
    }
  };

  const handleSuperDelete = async () => {
    const confirmed = window.confirm(
      "⚠️ WARNING: This will permanently delete ALL your data including:\n\n" +
      "• Your profile\n" +
      "• All notifications\n" +
      "• All connections\n" +
      "• Everything related to your account\n\n" +
      "This action CANNOT be undone. Are you absolutely sure?"
    );

    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      "This is your last chance. Type DELETE in the next prompt to confirm."
    );

    if (!doubleConfirm) return;

    const finalConfirm = window.prompt('Type "DELETE" to confirm permanent deletion:');
    if (finalConfirm !== "DELETE") {
      toast.error("Deletion cancelled");
      return;
    }

    try {
      const success = await superDeleteUser(currentUserID!);
      if (success) {
        await signOutUser();
        setCurrentUserID(null);
        router.push("/");
      }
    } catch (error) {
      console.error("Error in super delete:", error);
    }
  };

  const openEditSection = (section: string) => {
    if (userData.status === "approved" || userData.status === "pending") {
      toast.error("Profile is locked. Cannot edit while under review or approved.");
      return;
    }
    
    setActiveSection(section);
    setIsEditing(true);
  };

  const closeEditModal = () => {
    setIsEditing(false);
    setActiveSection(null);
    setEditableData(userData);
  };

  const isProfileComplete = () => {
    const personal = userData.personalDetails || {};
    const connection = userData.connectionDetails || {};
    const employment = userData.employmentDetails || {};
    
    return personal.fullName && 
           personal.age && 
           personal.gender &&
           connection.contactNumber && 
           connection.linkedIn &&
           connection.linkedIn.includes('linkedin.com') &&
           (employment.employmentStatus === "unemployed" || 
            (employment.employmentStatus === "employed" && employment.industry && employment.company)) &&
           userData.selectedCourses?.length > 0;
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      draft: {
        bgColor: "bg-gray-100",
        textColor: "text-gray-800",
        borderColor: "border-gray-200",
        icon: <Clock size={14} />,
        label: "Draft"
      },
      pending: {
        bgColor: "bg-amber-100",
        textColor: "text-amber-800",
        borderColor: "border-amber-200",
        icon: <Clock size={14} />,
        label: "Under Review"
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
        label: "Rejected - Will be deleted in 24h"
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

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
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={editableData.personalDetails?.fullName || ""}
                    onChange={(e) =>
                      handleChange("personalDetails", "fullName", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    value={editableData.personalDetails?.age || ""}
                    onChange={(e) =>
                      handleChange("personalDetails", "age", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    value={editableData.personalDetails?.gender || "male"}
                    onChange={(e) =>
                      handleChange("personalDetails", "gender", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            )}
            
            {activeSection === "employmentDetails" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employment Status *
                  </label>
                  <select
                    value={editableData.employmentDetails?.employmentStatus || "unemployed"}
                    onChange={(e) => {
                      handleChange("employmentDetails", "employmentStatus", e.target.value);
                      if (e.target.value === "unemployed") {
                        setEditableData((prev: any) => ({
                          ...prev,
                          employmentDetails: {
                            ...prev.employmentDetails,
                            employmentStatus: "unemployed",
                            industry: "",
                            company: "",
                            location: ""
                          }
                        }));
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  >
                    <option value="unemployed">Unemployed</option>
                    <option value="employed">Employed</option>
                  </select>
                </div>
                
                {editableData.employmentDetails?.employmentStatus === "employed" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Industry *
                      </label>
                      <select
                        value={editableData.employmentDetails?.industry || ""}
                        onChange={(e) =>
                          handleChange("employmentDetails", "industry", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Industry</option>
                        {INDUSTRIES.map(ind => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company *
                      </label>
                      <input
                        type="text"
                        value={editableData.employmentDetails?.company || ""}
                        onChange={(e) =>
                          handleChange("employmentDetails", "company", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        required
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
                        placeholder="e.g., Delhi, India"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
            
            {activeSection === "connectionDetails" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn Profile URL *
                  </label>
                  <input
                    type="url"
                    value={editableData.connectionDetails?.linkedIn || ""}
                    onChange={(e) =>
                      handleChange("connectionDetails", "linkedIn", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="https://linkedin.com/in/yourprofile"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be a valid LinkedIn URL</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    value={editableData.connectionDetails?.contactNumber || ""}
                    onChange={(e) =>
                      handleChange("connectionDetails", "contactNumber", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="+91 1234567890"
                    required
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
                
                {/* Camera button for upload */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="absolute bottom-0 right-0 bg-slate-800 text-white p-2 rounded-full hover:bg-slate-900 transition-colors shadow-lg disabled:opacity-50"
                  title="Upload profile picture"
                >
                  {uploadingImage ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Camera size={20} />
                  )}
                </button>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

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
                  {userData.employmentDetails?.employmentStatus === "employed" 
                    ? `${userData.employmentDetails.company || "Company"} • ${userData.employmentDetails.location || "Location"}` 
                    : userData.employmentDetails?.employmentStatus === "unemployed"
                    ? "Unemployed"
                    : "Employment information not provided"}
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => openEditSection("personalDetails")}
                  disabled={userData.status === "approved" || userData.status === "pending"}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm ${
                    userData.status === "approved" || userData.status === "pending"
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed" 
                      : "bg-slate-800 text-white hover:bg-slate-900"
                  }`}
                >
                  <Edit3 size={18} />
                  Edit Profile
                </button>
                <button 
                  onClick={() => setShowSuperDelete(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
                >
                  <Trash2 size={18} />
                  Super Delete
                </button>
              </div>
            </div>

            {(userData.status === "draft" || userData.status === "rejected") && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-1">
                      {userData.status === "rejected" ? "Profile Rejected - Will be deleted in 24 hours" : "Complete your profile for approval"}
                    </h3>
                    <p className="text-blue-600 text-sm">
                      Fill all required fields (*) and select at least one course to submit for approval
                    </p>
                    {!isProfileComplete() && (
                      <p className="text-red-600 text-sm mt-1 font-medium">
                        ⚠️ Profile incomplete. Please fill all required fields.
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleSubmitForApproval}
                    disabled={!isProfileComplete() || isSubmitting}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isProfileComplete() 
                        ? "bg-green-600 text-white hover:bg-green-700" 
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <Send size={18} />
                    {isSubmitting ? "Submitting..." : "Submit for Approval"}
                  </button>
                </div>
              </div>
            )}

            {userData.status === "pending" && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h3 className="font-semibold text-amber-800 mb-1">
                  Profile Under Review
                </h3>
                <p className="text-amber-600 text-sm">
                  Your profile is locked and being reviewed. You'll be notified once approved or if changes are needed.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <User size={20} className="text-slate-600" />
                    Personal Details
                  </h2>
                  <button 
                    onClick={() => openEditSection("personalDetails")}
                    disabled={userData.status === "approved" || userData.status === "pending"}
                    className={`p-1 rounded transition-colors ${
                      userData.status === "approved" || userData.status === "pending"
                        ? "text-gray-400 cursor-not-allowed" 
                        : "text-slate-600 hover:text-slate-800 hover:bg-slate-200"
                    }`}
                  >
                    <Edit3 size={18} />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Full Name {!userData.personalDetails?.fullName && <span className="text-red-500">*</span>}</p>
                    <p className="text-gray-800 font-medium">
                      {userData.personalDetails?.fullName || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Age {!userData.personalDetails?.age && <span className="text-red-500">*</span>}</p>
                    <p className="text-gray-800 font-medium">
                      {userData.personalDetails?.age ? `${userData.personalDetails.age} years` : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Gender {!userData.personalDetails?.gender && <span className="text-red-500">*</span>}</p>
                    <p className="text-gray-800 font-medium capitalize">
                      {userData.personalDetails?.gender || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Briefcase size={20} className="text-slate-600" />
                    Employment Details
                  </h2>
                  <button  
                    onClick={() => openEditSection("employmentDetails")}
                    disabled={userData.status === "approved" || userData.status === "pending"}
                    className={`p-1 rounded transition-colors ${
                      userData.status === "approved" || userData.status === "pending"
                        ? "text-gray-400 cursor-not-allowed" 
                        : "text-slate-600 hover:text-slate-800 hover:bg-slate-200"
                    }`}
                  >
                    <Edit3 size={18} />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status {!userData.employmentDetails?.employmentStatus && <span className="text-red-500">*</span>}</p>
                    <p className="text-gray-800 font-medium capitalize">
                      {userData.employmentDetails?.employmentStatus || "Not provided"}
                    </p>
                  </div>
                  {userData.employmentDetails?.employmentStatus === "employed" && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Industry {!userData.employmentDetails?.industry && <span className="text-red-500">*</span>}</p>
                        <p className="text-gray-800 font-medium">
                          {userData.employmentDetails?.industry || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Company {!userData.employmentDetails?.company && <span className="text-red-500">*</span>}</p>
                        <p className="text-gray-800 font-medium">
                          {userData.employmentDetails?.company || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Location</p>
                        <p className="text-gray-800 font-medium flex items-center gap-1">
                          <MapPin size={16} className="text-gray-500" />
                          {userData.employmentDetails?.location || "Not provided"}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 border border-gray-100 md:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Phone size={20} className="text-slate-600" />
                    Connection Details
                  </h2>
                  <button 
                    onClick={() => openEditSection("connectionDetails")}
                    disabled={userData.status === "approved" || userData.status === "pending"}
                    className={`p-1 rounded transition-colors ${
                      userData.status === "approved" || userData.status === "pending"
                        ? "text-gray-400 cursor-not-allowed" 
                        : "text-slate-600 hover:text-slate-800 hover:bg-slate-200"
                    }`}
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
                    <p className="text-sm text-gray-500 mb-1">Contact Number {!userData.connectionDetails?.contactNumber && <span className="text-red-500">*</span>}</p>
                    <p className="text-gray-800 font-medium">
                      {userData.connectionDetails?.contactNumber || "Not provided"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 mb-1">LinkedIn Profile {!userData.connectionDetails?.linkedIn && <span className="text-red-500">*</span>}</p>
                    {userData.connectionDetails?.linkedIn ? (
                      <a 
                        href={userData.connectionDetails.linkedIn} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-slate-700 hover:text-slate-900 hover:underline flex items-center gap-1 font-medium"
                      >
                        <Linkedin size={16} />
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
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Course Registration</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Enrollment Number: <span className="font-mono font-semibold">{userData.personalDetails?.enrollmentNumber || "Not generated"}</span>
                </p>
                
                {(userData.status === "approved" || userData.status === "pending") && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      Course selection cannot be modified after submission
                    </p>
                  </div>
                )}

                {!userData.selectedCourses?.length && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm font-medium">
                      ⚠️ Please select at least one course
                    </p>
                  </div>
                )}

                {loadingCourses ? (
                  <p>Loading courses...</p>
                ) : (
                  <div className="space-y-3">
                    {courses.map(course => {
                      const isRegistered = userData.selectedCourses?.includes(course.id);

                      return (
                        <div key={course.id} className="flex justify-between items-center p-3 border rounded-lg bg-white">
                          <div>
                            <p className="font-medium text-gray-800">{course.courseName}</p>
                            <p className="text-sm text-gray-500">{course.id}</p>
                          </div>
                          <button
                            onClick={() => handleCourseRegistration(course.id, isRegistered)}
                            disabled={userData.status === "approved" || userData.status === "pending"}
                            className={`px-4 py-2 rounded-lg text-white transition-colors ${
                              isRegistered 
                                ? "bg-red-600 hover:bg-red-700" 
                                : "bg-slate-800 hover:bg-slate-900"
                            } ${(userData.status === "approved" || userData.status === "pending") ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {isRegistered ? "Unregister" : "Register"}
                          </button>
                        </div>
                      );
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

      {/* Super Delete Confirmation Modal */}
      {showSuperDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle size={32} className="text-red-600" />
                <h3 className="text-xl font-bold text-gray-900">Super Delete Account</h3>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-4 font-semibold">
                  ⚠️ WARNING: This action will PERMANENTLY delete:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 mb-4">
                  <li>Your entire profile</li>
                  <li>All notifications</li>
                  <li>All connections and connection requests</li>
                  <li>All data associated with your account</li>
                </ul>
                <p className="text-red-600 font-bold">
                  This action CANNOT be undone!
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSuperDelete(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowSuperDelete(false);
                    handleSuperDelete();
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Delete Everything
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
