import { User } from "firebase/auth";
import { db } from "@/firebase/firebase";
import toast from "react-hot-toast";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, addDoc, query, where, orderBy, serverTimestamp, runTransaction } from "firebase/firestore";

// Generate unique enrollment number
const generateEnrollmentNumber = async (): Promise<string> => {
  const counterRef = doc(db, "counters", "enrollment");
  let enrollmentNumber = "CF0001";
  
  try {
    await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      if (counterDoc.exists()) {
        const currentCount = counterDoc.data().count;
        enrollmentNumber = `CF${(currentCount + 1).toString().padStart(4, '0')}`;
        transaction.update(counterRef, { count: currentCount + 1 });
      } else {
        transaction.set(counterRef, { count: 1 });
      }
    });
  } catch (error) {
    console.error("Error generating enrollment number:", error);
    // Fallback: use timestamp
    enrollmentNumber = `CF${Date.now().toString().slice(-6)}`;
  }
  
  return enrollmentNumber;
};

export const createUserDoc = async (userDoc: User) => {
  const userDocRef = doc(db, "users", userDoc.uid);
  const userSnapshot = await getDoc(userDocRef);

  if (!userSnapshot.exists()) {
    try {
      const enrollmentNumber = await generateEnrollmentNumber();
      
      await setDoc(userDocRef, {
        email: userDoc.email || "",
        status: "draft", // New users start as draft
        personalDetails: {
          enrollmentNumber: enrollmentNumber,
          fullName: "",
          age: "",
          gender: "male",
        },
        employmentDetails: {
          company: "",
          location: "",
        },
        connectionDetails: {
          linkedIn: "",
          contactNumber: "",
          emailAddress: userDoc.email || "",
        },
        selectedCourses: [],
        profileSubmitted: false,
        submissionDate: null,
        lastEditDate: null,
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
    throw new Error("User not found");
  }
  return userSnapshot.data();
};

// Update user profile (with restrictions)
export const updateUserDoc = async (userID: string, data: any, isAdmin: boolean = false) => {
  const userDocRef = doc(db, "users", userID);
  const userData = await getUserDoc(userID);
  
  // Check if user can edit profile
  if (!isAdmin && userData.status === "approved") {
    const lastEditDate = userData.lastEditDate?.toDate();
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    
    if (lastEditDate && lastEditDate > fifteenDaysAgo) {
      throw new Error("Profile can only be edited once every 15 days after approval");
    }
  }
  
  try {
    await updateDoc(userDocRef, {
      ...data,
      lastEditDate: serverTimestamp()
    });
    toast.success("Profile updated successfully!");
  } catch (e: any) {
    if (e.message.includes("15 days")) {
      throw e;
    }
    toast.error("Error updating profile");
    console.log(e);
  }
};

// Submit profile for approval
export const submitProfileForApproval = async (userID: string) => {
  const userDocRef = doc(db, "users", userID);
  const userData = await getUserDoc(userID);
  
  // Validate required fields
  const personalDetails = userData.personalDetails || {};
  const connectionDetails = userData.connectionDetails || {};
  
  if (!personalDetails.fullName || !personalDetails.age || !personalDetails.gender) {
    throw new Error("Please complete all personal details");
  }
  
  if (!connectionDetails.contactNumber || !connectionDetails.linkedIn) {
    throw new Error("Please complete all connection details");
  }
  
  if (!userData.selectedCourses || userData.selectedCourses.length === 0) {
    throw new Error("Please select at least one course");
  }
  
  try {
    await updateDoc(userDocRef, {
      status: "pending",
      profileSubmitted: true,
      submissionDate: serverTimestamp()
    });
    toast.success("Profile submitted for approval!");
  } catch (e) {
    toast.error("Error submitting profile");
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
    gender: string;
  };
  employmentDetails: {
    company: string;
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
        personalDetails: data.personalDetails || { enrollmentNumber: "", fullName: "", age: "", gender: "male" },
        employmentDetails: data.employmentDetails || { company: "", location: "" },
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
};

// Reject user
export const rejectUser = async (userID: string) => {
  const userRef = doc(db, "users", userID);
  await updateDoc(userRef, { status: "rejected" });
};

// Delete user
export const deleteUser = async (userID: string) => {
  await deleteDoc(doc(db, "users", userID));
};

// Add a new course
export const addCourse = async (courseCode: string, courseName: string) => {
  const courseRef = doc(db, "courses", courseCode);
  await setDoc(courseRef, { courseName, enrolledEmails: [] });
};

// Register user for course
export const registerCourse = async (courseCode: string, userID: string) => {
  const userDocRef = doc(db, "users", userID);
  const userData = await getUserDoc(userID);
  
  const selectedCourses = userData.selectedCourses || [];
  if (!selectedCourses.includes(courseCode)) {
    selectedCourses.push(courseCode);
  }
  
  await updateDoc(userDocRef, { selectedCourses });
  
  // Also add to course's enrolled emails
  const courseRef = doc(db, "courses", courseCode);
  const courseSnap = await getDoc(courseRef);
  if (courseSnap.exists()) {
    const enrolledEmails = courseSnap.data().enrolledEmails || [];
    const userEmail = userData.connectionDetails?.emailAddress;
    if (userEmail && !enrolledEmails.includes(userEmail)) {
      enrolledEmails.push(userEmail);
      await updateDoc(courseRef, { enrolledEmails });
    }
  }
  
  toast.success("Course registered successfully!");
};

// Unregister user from course
export const unregisterCourse = async (courseCode: string, userID: string) => {
  const userDocRef = doc(db, "users", userID);
  const userData = await getUserDoc(userID);
  
  const selectedCourses = userData.selectedCourses || [];
  const updatedCourses = selectedCourses.filter((course: string) => course !== courseCode);
  
  await updateDoc(userDocRef, { selectedCourses: updatedCourses });
  toast.success("Course unregistered successfully!");
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

// Fetch approved users (for fellows page)
export const fetchAllUsers = async () => {
  const usersCol = collection(db, "users");
  const usersSnapshot = await getDocs(usersCol);
  const allUsers: any[] = [];

  usersSnapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data?.status?.toLowerCase() === "approved") {
      allUsers.push({
        id: docSnap.id,
        email: data.email || "",
        status: data.status || "",
        personalDetails: data.personalDetails || { enrollmentNumber: "", fullName: "", age: "", gender: "male" },
        employmentDetails: data.employmentDetails || { company: "", location: "" },
        connectionDetails: data.connectionDetails || { linkedIn: "", contactNumber: "", emailAddress: "" },
        selectedCourses: data.selectedCourses || []
      });
    }
  });

  return allUsers;
};

// Forum Functions - Admin only posts
export interface ForumPost {
  id: string;
  title: string;
  content: string;
  relevantLinks?: string[];
  authorId: string;
  authorName: string;
  authorEmail: string;
  createdAt: any;
  updatedAt: any;
}

// Create a new forum post (Admin only)
export const createForumPost = async (title: string, content: string, relevantLinks: string[], authorId: string, authorName: string, authorEmail: string) => {
  try {
    const postsRef = collection(db, "forumPosts");
    const postData = {
      title,
      content,
      relevantLinks: relevantLinks || [],
      authorId,
      authorName,
      authorEmail,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(postsRef, postData);
    
    // Create notification for all approved users about new post
    const approvedUsers = await fetchAllUsers();
    const notifications = approvedUsers.map(user => 
      createNotification(
        "New Forum Post",
        `New discussion: ${title}`,
        "forum",
        docRef.id,
        user.id
      )
    );
    
    await Promise.all(notifications);
     
    return docRef.id;
  } catch (e) { 
    console.log(e);
    throw e;
  }
};

// Fetch all forum posts
export const fetchForumPosts = async (): Promise<ForumPost[]> => {
  const postsRef = collection(db, "forumPosts");
  const postsQuery = query(postsRef, orderBy("createdAt", "desc"));
  const postsSnapshot = await getDocs(postsQuery);
  
  const posts: ForumPost[] = [];
  
  postsSnapshot.forEach(docSnap => {
    const data = docSnap.data();
    posts.push({
      id: docSnap.id,
      title: data.title || "",
      content: data.content || "",
      relevantLinks: data.relevantLinks || [],
      authorId: data.authorId || "",
      authorName: data.authorName || "",
      authorEmail: data.authorEmail || "",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  });
  
  return posts;
};

// Notification Functions
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "forum" | "comment" | "system";
  read: boolean;
  userId: string;
  linkId?: string;
  createdAt: any;
}

// Create notification for specific user
export const createNotification = async (title: string, message: string, type: "forum" | "comment" | "system", linkId?: string, userId?: string) => {
  try {
    const notificationsRef = collection(db, "notifications");
    const notificationData = {
      title,
      message,
      type,
      read: false,
      userId: userId || null,
      linkId: linkId || null,
      createdAt: serverTimestamp(),
    };
    
    await addDoc(notificationsRef, notificationData);
  } catch (e) {
    console.error("Error creating notification:", e);
  }
};

// Fetch notifications for specific user
export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  const notificationsRef = collection(db, "notifications");
  let userNotifications: Notification[] = [];
  
  try {
    const userQuery = query(
      notificationsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const userSnapshot = await getDocs(userQuery);
    
    userSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      userNotifications.push({
        id: docSnap.id,
        title: data.title || "",
        message: data.message || "",
        type: data.type || "system",
        read: data.read || false,
        userId: data.userId,
        linkId: data.linkId,
        createdAt: data.createdAt,
      });
    });
    
  } catch (error) {
    console.error("Error fetching notifications:", error);
    // Fallback
    const allSnapshot = await getDocs(notificationsRef);
    allSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.userId === userId) {
        userNotifications.push({
          id: docSnap.id,
          title: data.title || "",
          message: data.message || "",
          type: data.type || "system",
          read: data.read || false,
          userId: data.userId,
          linkId: data.linkId,
          createdAt: data.createdAt,
        });
      }
    });
    
    userNotifications.sort((a, b) => {
      const timeA = a.createdAt?.toDate?.()?.getTime() || 0;
      const timeB = b.createdAt?.toDate?.()?.getTime() || 0;
      return timeB - timeA;
    });
  }
  
  return userNotifications;
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
  } catch (e) {
    console.error("Error marking notification as read:", e);
  }
};

// Mark all notifications as read for user
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const notificationsRef = collection(db, "notifications");
    const userQuery = query(
      notificationsRef,
      where("userId", "==", userId),
      where("read", "==", false)
    );
    
    const notificationsSnapshot = await getDocs(userQuery);
    const updatePromises: Promise<void>[] = [];
    
    notificationsSnapshot.docs.forEach(docSnap => {
      updatePromises.push(updateDoc(doc(db, "notifications", docSnap.id), { read: true }));
    });
    
    await Promise.all(updatePromises);
  } catch (e) {
    console.error("Error marking all notifications as read:", e);
  }
};