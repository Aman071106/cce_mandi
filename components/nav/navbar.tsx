"use client";

import React, { useContext, useState, useEffect } from "react";
import Image from "next/image";
import sntcLogo from "@/public/sntc.png";
import { Menu, X, User, Bell, Plus, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signInWithGooglePopup, signOutUser } from "@/firebase/firebase";
import { UserContext } from "@/context/user-context";
import { createUserDoc, getUserDoc, fetchNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "@/lib/actions";
import toast from "react-hot-toast";
import { setUserCookie } from "@/lib/server-actions";

const adminEmail = "aman07112006@gmail.com";

const Navbar = () => {
  const [toggle, setToggle] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { currentUserID, setCurrentUserID } = useContext(UserContext);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (currentUserID) {
        try {
          const userData = await getUserDoc(currentUserID);
          const email = userData.connectionDetails?.emailAddress;
          setUserEmail(email);
          setIsAdmin(email === adminEmail);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    checkAdminStatus();
  }, [currentUserID]);

  useEffect(() => {
    const loadNotifications = async () => {
      if (currentUserID) {
        try { 
          const userNotifications = await fetchNotifications(currentUserID);
          setNotifications(userNotifications);
        } catch (error) {
          console.error("Error loading notifications:", error);
        }
      }
    };

    loadNotifications();
    
    const interval = setInterval(loadNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [currentUserID]);

  const loginUser = async () => {
    try {
      const { user } = await signInWithGooglePopup();
      if (user.email) {
        setCurrentUserID(user.uid);
        await createUserDoc(user);
        await setUserCookie(user.uid);
        setUserEmail(user.email);
        setIsAdmin(user.email === adminEmail);
        toast.success("Signed in successfully!");
        
        // Redirect based on approval status
        const userData = await getUserDoc(user.uid);
        if (userData.status === "approved") {
          router.push("/fellows");
        } else {
          router.push("/profile");
        }
      }
    } catch (e) {
      toast.error("Error signing in. More info in console");
      console.log(e);
    }
  };

  const logoutUser = async () => {
    try {
      await signOutUser();
      setCurrentUserID(null);
      setUserEmail(null);
      setIsAdmin(false);
      setNotifications([]);
      toast.success("Signed out successfully!");
      router.push("/");
    } catch (e) {
      toast.error("Error signing out");
      console.log(e);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (currentUserID) {
      try {
        await markAllNotificationsAsRead(currentUserID);
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        setShowNotifications(false);
      } catch (error) {
        console.error("Error marking notifications as read:", error);
      }
    }
  };

  const handleNotificationClick = async (notification: any) => {
    await markNotificationAsRead(notification.id);
    setNotifications(prev => prev.map(notif => 
      notif.id === notification.id ? { ...notif, read: true } : notif
    ));
    
    if (notification.linkId && notification.type === "forum") {
      router.push(`/forum#post-${notification.linkId}`);
    }
    setShowNotifications(false);
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  const isActiveLink = (path: string) => {
    return pathname === path ? "text-slate-800 font-semibold border-b-2 border-slate-800" : "text-slate-600 hover:text-slate-800";
  };

  return (
    <>
      <nav className="w-full bg-white h-full px-5 sm:px-8 py-3 flex flex-row justify-between items-center border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <Image
              src={sntcLogo}
              alt="SnTC logo"
              className="h-12 xs:h-16 sm:h-20 md:h-24 lg:h-28 w-auto object-contain"
            />
          </Link>
          
          <div className="hidden md:flex gap-6 items-center text-xl font-medium text-slate-700">
            <Link href="/" className={`transition-colors pb-1 ${isActiveLink("/")}`}>
              Home
            </Link>
            <Link href="/contact" className={`transition-colors pb-1 ${isActiveLink("/contact")}`}>
              Contact
            </Link>
            {currentUserID && (
              <>
                <Link href="/forum" className={`transition-colors pb-1 ${isActiveLink("/forum")}`}>
                  Forum
                </Link>
                <Link href="/fellows" className={`transition-colors pb-1 ${isActiveLink("/fellows")}`}>
                  Fellows
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {currentUserID ? (
            <div className="flex items-center gap-4">
              {/* Notifications Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-md text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <MessageSquare size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 text-sm">
                                  {notification.title}
                                </p>
                                <p className="text-gray-600 text-sm mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {notification.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Icon */}
              <Link href="/profile">
                <button className="p-2 rounded-md text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors">
                  <User size={20} />
                </button>
              </Link>

              {/* Create Post Button (Admin only) */}
              {isAdmin && (
                <Link href="/forum/create">
                  <button className="flex items-center gap-2 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                    <Plus size={16} />
                    Create Post
                  </button>
                </Link>
              )}
              
              {/* Admin Dashboard */}
              {isAdmin && (
                <Link href="/dashboardAdmin">
                  <button className="flex items-center gap-2 py-2 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors">
                    Admin Dashboard
                  </button>
                </Link>
              )}
              
              {/* Logout Button - RED */}
              <button
                onClick={logoutUser}
                className="text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors flex items-center gap-1 text-sm py-2 px-4 rounded-lg font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            <button onClick={loginUser} className="py-2 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors">
              Login
            </button>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          {currentUserID && (
            <>
              {/* Mobile Notifications Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-md text-slate-600 hover:text-slate-800 transition-colors"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Create Post Button for Mobile (Admin only) */}
              {isAdmin && (
                <Link href="/forum/create" className="p-2 rounded-md text-green-600 hover:text-green-800 transition-colors">
                  <Plus size={20} />
                </Link>
              )}
            </>
          )}
          
          <button
            onClick={() => setToggle(!toggle)}
            className="p-2 rounded-md text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {toggle ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`${toggle ? "flex" : "hidden"} md:hidden bg-white w-full p-5 flex-col gap-4 text-base font-medium border-b border-gray-200 shadow-sm`}
      >
        <Link 
          href="/" 
          className={`py-2 transition-colors ${isActiveLink("/")}`}
          onClick={() => setToggle(false)}
        >
          Home
        </Link>
        
        <Link 
          href="/contact" 
          className={`py-2 transition-colors ${isActiveLink("/contact")}`}
          onClick={() => setToggle(false)}
        >
          Contact
        </Link>
        
        {currentUserID && (
          <>
            <Link 
              href="/forum" 
              className={`py-2 transition-colors ${isActiveLink("/forum")}`}
              onClick={() => setToggle(false)}
            >
              Forum
            </Link>
            
            <Link 
              href="/fellows" 
              className={`py-2 transition-colors ${isActiveLink("/fellows")}`}
              onClick={() => setToggle(false)}
            >
              Fellows
            </Link>
            
            <Link 
              href="/profile" 
              className={`py-2 transition-colors ${isActiveLink("/profile")}`}
              onClick={() => setToggle(false)}
            >
              Profile
            </Link>
            
            {isAdmin && (
              <Link 
                href="/dashboardAdmin" 
                className={`py-2 transition-colors ${isActiveLink("/dashboard")}`}
                onClick={() => setToggle(false)}
              >
                Dashboard
              </Link>
            )}
            
            <button
              onClick={async () => {
                await logoutUser();
                setToggle(false);
              }}
              className="text-left py-2 text-red-600 hover:text-red-800 transition-colors flex items-center gap-2 font-medium"
            >
              Logout
            </button>
          </>
        )}
        
        {!currentUserID && (
          <button
            onClick={async () => {
              await loginUser();
              setToggle(false);
            }}
            className="text-left py-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            Login
          </button>
        )}
      </div>

      {/* Mobile Notifications Panel */}
      {showNotifications && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowNotifications(false)}>
          <div className="absolute top-16 right-0 left-0 bg-white rounded-b-lg shadow-lg max-h-80 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              )}
            </div>
            
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <MessageSquare size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm">
                          {notification.title}
                        </p>
                        <p className="text-gray-600 text-sm mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {notification.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
