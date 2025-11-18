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
        status: "draft",
        personalDetails: {
          enrollmentNumber: enrollmentNumber,
          fullName: "",
          age: "",
          gender: "male",
          profileImage: null, // ✅ Add this with null value
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
// Add this function to lib/actions.ts

// Upload profile picture to Cloudinary
export const uploadProfilePicture = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
  
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};

// Update user profile picture
export const updateUserProfilePicture = async (userID: string, imageUrl: string) => {
  const userDocRef = doc(db, "users", userID);
  
  try {
    await updateDoc(userDocRef, {
      "personalDetails.profileImage": imageUrl,
      lastEditDate: serverTimestamp()
    });
    toast.success("Profile picture updated successfully!");
  } catch (error) {
    console.error("Error updating profile picture:", error);
    toast.error("Failed to update profile picture");
    throw error;
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
export const superDeleteUser = async (userID: string): Promise<boolean> => {
  try {
    console.log(`Starting super delete for user: ${userID}`);
    
    // Get user data first to use for cleanup
    const userData = await getUserDoc(userID);
    const userEmail = userData.connectionDetails?.emailAddress || userData.email;

    // Perform all deletions in a transaction for data consistency
    await runTransaction(db, async (transaction) => {
      // 1. Delete user document
      const userRef = doc(db, "users", userID);
      transaction.delete(userRef);

      // 2. Delete all notifications for this user
      const notificationsRef = collection(db, "notifications");
      const userNotificationsQuery = query(notificationsRef, where("userId", "==", userID));
      const notificationsSnapshot = await getDocs(userNotificationsQuery);
      notificationsSnapshot.forEach(docSnap => {
        transaction.delete(doc(db, "notifications", docSnap.id));
      });

      // 3. Remove user from all course enrollments
      const coursesRef = collection(db, "courses");
      const coursesSnapshot = await getDocs(coursesRef);
      coursesSnapshot.forEach(courseDoc => {
        const courseData = courseDoc.data();
        if (courseData.enrolledEmails && Array.isArray(courseData.enrolledEmails)) {
          const updatedEmails = courseData.enrolledEmails.filter((email: string) => email !== userEmail);
          if (updatedEmails.length !== courseData.enrolledEmails.length) {
            transaction.update(doc(db, "courses", courseDoc.id), {
              enrolledEmails: updatedEmails
            });
          }
        }
      });

      // 4. Delete forum posts by this user
      const forumPostsRef = collection(db, "forumPosts");
      const userPostsQuery = query(forumPostsRef, where("authorId", "==", userID));
      const postsSnapshot = await getDocs(userPostsQuery);
      postsSnapshot.forEach(docSnap => {
        transaction.delete(doc(db, "forumPosts", docSnap.id));
      });

      // 5. Delete any comments by this user (if you have a comments collection)
      try {
        const commentsRef = collection(db, "comments");
        const userCommentsQuery = query(commentsRef, where("authorId", "==", userID));
        const commentsSnapshot = await getDocs(userCommentsQuery);
        commentsSnapshot.forEach(docSnap => {
          transaction.delete(doc(db, "comments", docSnap.id));
        });
      } catch (error) {
        console.log("No comments collection or error deleting comments:", error);
      }

      // 6. Delete connection requests (if you have a connections collection)
      try {
        const connectionsRef = collection(db, "connections");
        const userConnectionsQuery = query(
          connectionsRef, 
          where("fromUserId", "==", userID)
        );
        const connectionsSnapshot = await getDocs(userConnectionsQuery);
        connectionsSnapshot.forEach(docSnap => {
          transaction.delete(doc(db, "connections", docSnap.id));
        });

        // Also delete connections where this user is the target
        const targetConnectionsQuery = query(
          connectionsRef, 
          where("toUserId", "==", userID)
        );
        const targetConnectionsSnapshot = await getDocs(targetConnectionsQuery);
        targetConnectionsSnapshot.forEach(docSnap => {
          transaction.delete(doc(db, "connections", docSnap.id));
        });
      } catch (error) {
        console.log("No connections collection or error deleting connections:", error);
      }

      // 7. Delete any chat messages (if you have a messages collection)
      try {
        const messagesRef = collection(db, "messages");
        const userMessagesQuery = query(messagesRef, where("senderId", "==", userID));
        const messagesSnapshot = await getDocs(userMessagesQuery);
        messagesSnapshot.forEach(docSnap => {
          transaction.delete(doc(db, "messages", docSnap.id));
        });
      } catch (error) {
        console.log("No messages collection or error deleting messages:", error);
      }

      // 8. Delete user preferences/settings (if you have a settings collection)
      try {
        const settingsRef = doc(db, "userSettings", userID);
        transaction.delete(settingsRef);
      } catch (error) {
        console.log("No userSettings collection or error deleting settings:", error);
      }
    });

    console.log(`Super delete completed successfully for user: ${userID}`);
    toast.success("All your data has been permanently deleted");
    return true;

  } catch (error) {
    console.error("Error during super delete:", error);
    toast.error("Failed to delete all user data. Please try again.");
    return false;
  }
};



// Add these connection functions to your existing Firebase actions file

// Connection Interfaces
export interface Connection {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserEmail: string;
  toUserId: string;
  toUserName: string;
  toUserEmail: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: any;
  updatedAt: any;
}

// Send connection request
export const sendConnectionRequest = async (fromUserId: string, toUserId: string) => {
  try {
    // Get user data for both users
    const fromUserData = await getUserDoc(fromUserId);
    const toUserData = await getUserDoc(toUserId);

    // Check if connection already exists
    const connectionsRef = collection(db, "connections");
    const existingConnectionQuery = query(
      connectionsRef,
      where("fromUserId", "==", fromUserId),
      where("toUserId", "==", toUserId)
    );
    const existingConnectionSnapshot = await getDocs(existingConnectionQuery);

    if (!existingConnectionSnapshot.empty) {
      toast.error("Connection request already sent");
      return;
    }

    // Check if reverse connection exists
    const reverseConnectionQuery = query(
      connectionsRef,
      where("fromUserId", "==", toUserId),
      where("toUserId", "==", fromUserId)
    );
    const reverseConnectionSnapshot = await getDocs(reverseConnectionQuery);

    if (!reverseConnectionSnapshot.empty) {
      toast.error("Connection already exists");
      return;
    }

    // Create connection request
    const connectionData = {
      fromUserId,
      fromUserName: fromUserData.personalDetails?.fullName || "Unknown User",
      fromUserEmail: fromUserData.connectionDetails?.emailAddress || fromUserData.email,
      toUserId,
      toUserName: toUserData.personalDetails?.fullName || "Unknown User",
      toUserEmail: toUserData.connectionDetails?.emailAddress || toUserData.email,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await addDoc(connectionsRef, connectionData);

    // Create notification for the recipient
    await createNotification(
      "New Connection Request",
      `${fromUserData.personalDetails?.fullName || "Someone"} wants to connect with you`,
      "system",
      undefined,
      toUserId
    );

    toast.success("Connection request sent!");
  } catch (error) {
    console.error("Error sending connection request:", error);
    toast.error("Failed to send connection request");
  }
};

// Get user's connections (both sent and received)
export const getConnections = async (userId: string): Promise<Connection[]> => {
  try {
    const connectionsRef = collection(db, "connections");
    
    // Get connections where user is the sender
    const sentQuery = query(
      connectionsRef,
      where("fromUserId", "==", userId),
      where("status", "in", ["accepted", "pending"])
    );
    
    // Get connections where user is the receiver
    const receivedQuery = query(
      connectionsRef,
      where("toUserId", "==", userId),
      where("status", "in", ["accepted", "pending"])
    );

    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      getDocs(sentQuery),
      getDocs(receivedQuery)
    ]);

    const connections: Connection[] = [];

    sentSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      connections.push({
        id: docSnap.id,
        fromUserId: data.fromUserId,
        fromUserName: data.fromUserName,
        fromUserEmail: data.fromUserEmail,
        toUserId: data.toUserId,
        toUserName: data.toUserName,
        toUserEmail: data.toUserEmail,
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    receivedSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      connections.push({
        id: docSnap.id,
        fromUserId: data.fromUserId,
        fromUserName: data.fromUserName,
        fromUserEmail: data.fromUserEmail,
        toUserId: data.toUserId,
        toUserName: data.toUserName,
        toUserEmail: data.toUserEmail,
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    return connections;
  } catch (error) {
    console.error("Error getting connections:", error);
    return [];
  }
};

// Get pending connection requests for a user
export const getConnectionRequests = async (userId: string): Promise<Connection[]> => {
  try {
    const connectionsRef = collection(db, "connections");
    const requestsQuery = query(
      connectionsRef,
      where("toUserId", "==", userId),
      where("status", "==", "pending")
    );

    const requestsSnapshot = await getDocs(requestsQuery);
    const requests: Connection[] = [];

    requestsSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      requests.push({
        id: docSnap.id,
        fromUserId: data.fromUserId,
        fromUserName: data.fromUserName,
        fromUserEmail: data.fromUserEmail,
        toUserId: data.toUserId,
        toUserName: data.toUserName,
        toUserEmail: data.toUserEmail,
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    return requests;
  } catch (error) {
    console.error("Error getting connection requests:", error);
    return [];
  }
};

// Accept connection request
export const acceptConnectionRequest = async (requestId: string, fromUserId: string, toUserId: string) => {
  try {
    const connectionRef = doc(db, "connections", requestId);
    
    await updateDoc(connectionRef, {
      status: "accepted",
      updatedAt: serverTimestamp()
    });

    // Create notification for the requester
    const toUserData = await getUserDoc(toUserId);
    await createNotification(
      "Connection Request Accepted",
      `${toUserData.personalDetails?.fullName || "Someone"} accepted your connection request`,
      "system",
      undefined,
      fromUserId
    );

    toast.success("Connection request accepted!");
  } catch (error) {
    console.error("Error accepting connection request:", error);
    toast.error("Failed to accept connection request");
  }
};

// Reject connection request
export const rejectConnectionRequest = async (requestId: string) => {
  try {
    const connectionRef = doc(db, "connections", requestId);
    
    await updateDoc(connectionRef, {
      status: "rejected",
      updatedAt: serverTimestamp()
    });

    toast.success("Connection request rejected");
  } catch (error) {
    console.error("Error rejecting connection request:", error);
    toast.error("Failed to reject connection request");
  }
};

// Remove connection (for both users)
export const removeConnection = async (connectionId: string) => {
  try {
    await deleteDoc(doc(db, "connections", connectionId));
    toast.success("Connection removed");
  } catch (error) {
    console.error("Error removing connection:", error);
    toast.error("Failed to remove connection");
  }
};

// Check if two users are connected
export const checkIfConnected = async (user1Id: string, user2Id: string): Promise<boolean> => {
  try {
    const connectionsRef = collection(db, "connections");
    
    const connectionQuery = query(
      connectionsRef,
      where("status", "==", "accepted"),
      where("fromUserId", "in", [user1Id, user2Id]),
      where("toUserId", "in", [user1Id, user2Id])
    );

    const connectionSnapshot = await getDocs(connectionQuery);
    return !connectionSnapshot.empty;
  } catch (error) {
    console.error("Error checking connection:", error);
    return false;
  }
};
