import { User } from "firebase/auth";
import { db } from "@/firebase/firebase";
import toast from "react-hot-toast";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, addDoc, query, where, orderBy, serverTimestamp } from "firebase/firestore";

// ... (keep all your existing functions)

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

// Fetch approved users (for fellows page)
export const fetchAllUsers = async () => {
  const usersCol = collection(db, "users");
  const usersSnapshot = await getDocs(usersCol);
  const allUsers: any[] = [];

  usersSnapshot.forEach(docSnap => {
    const data = docSnap.data();
    // Check if status exists and equals "approved"
    if (data?.status?.toLowerCase() === "approved") {
      allUsers.push({
        id: docSnap.id,
        email: data.email || "",
        status: data.status || "",
        personalDetails: data.personalDetails || { enrollmentNumber: "", fullName: "", age: "" },
        employmentDetails: data.employmentDetails || { company: "", industry: "", location: "", experience: "" },
        connectionDetails: data.connectionDetails || { linkedIn: "", contactNumber: "", emailAddress: "" },
        selectedCourses: data.selectedCourses || []
      });
    }
  });

  return allUsers;
};

// Forum Functions
export interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  createdAt: any;
  updatedAt: any;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  createdAt: any;
}

// Create a new forum post
export const createForumPost = async (title: string, content: string, authorId: string, authorName: string, authorEmail: string) => {
  try {
    const postsRef = collection(db, "forumPosts");
    const postData = {
      title,
      content,
      authorId,
      authorName,
      authorEmail,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(postsRef, postData);
    
    // Create notification for all users about new post
    await createNotification(
      "New Forum Post",
      `New discussion: ${title}`,
      "forum",
      docRef.id
    );
     
    return docRef.id;
  } catch (e) { 
    console.log(e);
    throw e;
  }
};

// Fetch all forum posts with comments
export const fetchForumPosts = async (): Promise<ForumPost[]> => {
  const postsRef = collection(db, "forumPosts");
  const postsQuery = query(postsRef, orderBy("createdAt", "desc"));
  const postsSnapshot = await getDocs(postsQuery);
  
  const posts: ForumPost[] = [];
  
  for (const docSnap of postsSnapshot.docs) {
    const data = docSnap.data();
    const comments = await fetchCommentsForPost(docSnap.id);
    
    posts.push({
      id: docSnap.id,
      title: data.title || "",
      content: data.content || "",
      authorId: data.authorId || "",
      authorName: data.authorName || "",
      authorEmail: data.authorEmail || "",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      comments: comments,
    });
  }
  
  return posts;
};

// Add comment to a post
export const addCommentToPost = async (postId: string, content: string, authorId: string, authorName: string, authorEmail: string) => {
  try {
    const commentsRef = collection(db, "forumComments");
    const commentData = {
      postId,
      content,
      authorId,
      authorName,
      authorEmail,
      createdAt: serverTimestamp(),
    };
    
    await addDoc(commentsRef, commentData);
    
    // Create notification for post author about new comment
    const postDoc = await getDoc(doc(db, "forumPosts", postId));
    if (postDoc.exists()) {
      const postData = postDoc.data();
      if (postData.authorId !== authorId) {
        await createNotification(
          "New Comment",
          `${authorName} commented on your post: "${content.substring(0, 50)}..."`,
          "comment",
          postId
        );
      }
    }
     
  } catch (e) {
    toast.error("Error adding comment");
    console.log(e);
    throw e;
  }
};

// Fetch comments for a specific post
export const fetchCommentsForPost = async (postId: string): Promise<Comment[]> => {
  const commentsRef = collection(db, "forumComments");
  let comments: Comment[] = [];
  
  try {
    // Try the optimized query first
    const commentsQuery = query(commentsRef, where("postId", "==", postId));
    const commentsSnapshot = await getDocs(commentsQuery);
    
    commentsSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      comments.push({
        id: docSnap.id,
        postId: data.postId,
        content: data.content || "",
        authorId: data.authorId || "",
        authorName: data.authorName || "",
        authorEmail: data.authorEmail || "",
        createdAt: data.createdAt,
      });
    });
    
    // Sort manually by createdAt on client side
    comments.sort((a, b) => {
      const timeA = a.createdAt?.toDate?.()?.getTime() || 0;
      const timeB = b.createdAt?.toDate?.()?.getTime() || 0;
      return timeA - timeB; // Ascending order (oldest first for comments)
    });
    
  } catch (error) {
    console.error("Error fetching comments:", error);
    // Fallback: get all comments and filter manually
    const allSnapshot = await getDocs(commentsRef);
    allSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.postId === postId) {
        comments.push({
          id: docSnap.id,
          postId: data.postId,
          content: data.content || "",
          authorId: data.authorId || "",
          authorName: data.authorName || "",
          authorEmail: data.authorEmail || "",
          createdAt: data.createdAt,
        });
      }
    });
    
    // Sort manually
    comments.sort((a, b) => {
      const timeA = a.createdAt?.toDate?.()?.getTime() || 0;
      const timeB = b.createdAt?.toDate?.()?.getTime() || 0;
      return timeA - timeB;
    });
  }
  
  return comments;
};

// Notification Functions
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "forum" | "comment" | "system";
  read: boolean;
  userId?: string; // if specific to user
  linkId?: string; // postId or commentId
  createdAt: any;
}

// Create notification
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

// Fetch notifications for user
export const fetchNotifications = async (userId?: string): Promise<Notification[]> => {
  const notificationsRef = collection(db, "notifications");
  let allNotifications: Notification[] = [];
  
  try {
    if (userId) {
      // First get user-specific notifications
      const userQuery = query(
        notificationsRef,
        where("userId", "==", userId)
      );
      const userSnapshot = await getDocs(userQuery);
      
      userSnapshot.forEach(docSnap => {
        const data = docSnap.data();
        allNotifications.push({
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
    }
    
    // Then get general notifications (no specific user)
    const generalQuery = query(
      notificationsRef,
      where("userId", "==", null)
    );
    const generalSnapshot = await getDocs(generalQuery);
    
    generalSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      allNotifications.push({
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
    
    // Sort manually by createdAt on client side
    allNotifications.sort((a, b) => {
      const timeA = a.createdAt?.toDate?.()?.getTime() || 0;
      const timeB = b.createdAt?.toDate?.()?.getTime() || 0;
      return timeB - timeA; // Descending order (newest first)
    });
    
  } catch (error) {
    console.error("Error fetching notifications:", error);
    // Fallback: get all notifications and filter manually
    const allSnapshot = await getDocs(notificationsRef);
    allSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (!userId || data.userId === userId || data.userId === null) {
        allNotifications.push({
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
    
    // Sort manually
    allNotifications.sort((a, b) => {
      const timeA = a.createdAt?.toDate?.()?.getTime() || 0;
      const timeB = b.createdAt?.toDate?.()?.getTime() || 0;
      return timeB - timeA;
    });
  }
  
  return allNotifications;
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

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId?: string) => {
  try {
    const notificationsRef = collection(db, "notifications");
    const notificationsSnapshot = await getDocs(notificationsRef);
    
    const updatePromises: Promise<void>[] = [];
    
    notificationsSnapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      // Filter on client side
      if (!data.read && (userId ? data.userId === userId : data.userId === null)) {
        updatePromises.push(updateDoc(doc(db, "notifications", docSnap.id), { read: true }));
      }
    });
    
    await Promise.all(updatePromises);
  } catch (e) {
    console.error("Error marking all notifications as read:", e);
  }
};