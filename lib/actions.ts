import { User } from "firebase/auth";
import { db } from "@/firebase/firebase";
import toast from "react-hot-toast";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore";

export const createUserDoc = async (userDoc: User) => {
  const userDocRef = doc(db, "users", userDoc.uid);
  const userSnapshot = await getDoc(userDocRef);

  if (!userSnapshot.exists()) {
    try {
      await setDoc(userDocRef, {
        email: userDoc.email || "",
        status: "pending", // first-time login status
        personalDetails: {
          enrollmentNumber: "",
          fullName: "",
          age: "",
        },
        employmentDetails: {
          company: "",
          industry: "",
          location: "",
        },
        connectionDetails: {
          linkedIn: "",
          contactNumber: "",
          emailAddress: userDoc.email || "",
        },
        selectedCourses: [],
      });
    } catch (e) {
      toast.error("Unexpected error creating user. See console.");
      console.log(e);
    }
  }

  return userDocRef;
};

// Fetch user data
export const getUserDoc = async (userID: string) => {
  const userDocRef = doc(db, "users", userID);
  const userSnapshot = await getDoc(userDocRef);

  if (!userSnapshot.exists()) {
    // toast.error("User not found!");
    throw new Error("User not found");
  }
  return userSnapshot.data();
};

// Update user profile
export const updateUserDoc = async (userID: string, data: any) => {
  const userDocRef = doc(db, "users", userID);
  try {
    await updateDoc(userDocRef, data);
    toast.success("Profile updated successfully!");
  } catch (e) {
    toast.error("Error updating profile");
    console.log(e);
  }
};


// Fetch all pending users
interface PendingUser {
  id: string;
  email: string;
  status: string;
  personalDetails: {
    enrollmentNumber: string;
    fullName: string;
    age: string;
  };
  employmentDetails: {
    company: string;
    industry: string;
    location: string;
  };
  connectionDetails: {
    linkedIn: string;
    contactNumber: string;
    emailAddress: string;
  };
  selectedCourses: string[];
}

export const fetchPendingUsers = async () => {
  const usersCol = collection(db, "users");
  const usersSnapshot = await getDocs(usersCol);
  const pendingUsers: PendingUser[] = [];
  usersSnapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.status === "pending") {
      pendingUsers.push({
        id: docSnap.id,
        email: data.email || "",
        status: data.status || "",
        personalDetails: data.personalDetails || { enrollmentNumber: "", fullName: "", age: "" },
        employmentDetails: data.employmentDetails || { company: "", industry: "", location: "" },
        connectionDetails: data.connectionDetails || { linkedIn: "", contactNumber: "", emailAddress: "" },
        selectedCourses: data.selectedCourses || []
      });
    }
  });
  return pendingUsers;
};

// Approve user
export const approveUser = async (userID: string) => {
  const userRef = doc(db, "users", userID);
  await updateDoc(userRef, { status: "approved" });
  // toast.success("User approved!");
};

// Reject user
export const rejectUser = async (userID: string) => {
  const userRef = doc(db, "users", userID);
  await updateDoc(userRef, { status: "rejected" });
  // toast.success("User rejected!");
};

// Delete user
export const deleteUser = async (userID: string) => {
  await deleteDoc(doc(db, "users", userID));
  // toast.success("User deleted!");
};

// Add a new course
export const addCourse = async (courseCode: string, courseName: string) => {
  const courseRef = doc(db, "courses", courseCode);
  await setDoc(courseRef, { courseName, enrolledEmails: [] });
  // toast.success("Course added!");
};

// Register user email to course
export const registerCourse = async (courseCode: string, userEmail: string) => {
  const courseRef = doc(db, "courses", courseCode);
  const courseSnap = await getDoc(courseRef);
  if (!courseSnap.exists()) throw new Error("Course not found");

  const enrolledEmails = courseSnap.data().enrolledEmails || [];
  if (!enrolledEmails.includes(userEmail)) enrolledEmails.push(userEmail);

  await updateDoc(courseRef, { enrolledEmails });
  toast.success("Registered for course successfully!");
};

// Fetch all courses
export const fetchCourses = async () => {
  const coursesCol = collection(db, "courses");
  const courseSnapshot = await getDocs(coursesCol);
  interface Course {
    id: string;
    courseName: string;
    enrolledEmails: string[];
  }
  const courses: Course[] = [];
  courseSnapshot.forEach(docSnap => {
    const data = docSnap.data();
    courses.push({
      id: docSnap.id,
      courseName: data.courseName || "",
      enrolledEmails: data.enrolledEmails || []
    });
  });
  return courses;
};