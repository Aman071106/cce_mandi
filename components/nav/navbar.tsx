"use client";

import React, { useContext, useState, useEffect } from "react";
import Image from "next/image";
import sntcLogo from "@/public/sntc.png";
import Button from "@/components/button/button";
import { Menu, X, User, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signInWithGooglePopup, signOutUser } from "@/firebase/firebase";
import { UserContext } from "@/context/user-context";
import { createUserDoc, getUserDoc } from "@/lib/actions";
import toast from "react-hot-toast";
import { setUserCookie } from "@/lib/server-actions";
const adminEmail="aman07112006@gmail.com"
const Navbar = () => {
  const [toggle, setToggle] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
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
        router.push("/profile");
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
      toast.success("Signed out successfully!");
      router.push("/");
    } catch (e) {
      toast.error("Error signing out");
      console.log(e);
    }
  };

  const isActiveLink = (path: string) => {
    return pathname === path ? "text-slate-800 font-semibold" : "text-slate-600 hover:text-slate-800";
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
            <Link href="/" className={`transition-colors ${isActiveLink("/")}`}>
              Home
            </Link>
            
            <Link href="/contact" className={`transition-colors ${isActiveLink("/contact")}`}>
              Contact
            </Link>
            {/* {isAdmin && (
              // <Link href="/dashboard" className={`transition-colors ${isActiveLink("/dashboard")}`}>
              //   Dashboard
              // </Link>
            )} */}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {currentUserID ? (
            <div className="flex items-center gap-4">
              <Link href="/profile">
                <Button variant="outline" className="flex items-center gap-2 py-2 px-4">
                  <User size={16} />
                  Profile
                </Button>
              </Link>
              {isAdmin && (
                <Link href="/dashboardAdmin">
                  <Button className="flex items-center gap-2 py-2 px-4 bg-slate-800 hover:bg-slate-900">
                    <LayoutDashboard size={16} />
                    Admin Dashboard
                  </Button>
                </Link>
              )}
              <button
                onClick={logoutUser}
                className="text-slate-600 hover:text-slate-800 transition-colors flex items-center gap-1 text-sm"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <Button onClick={loginUser} className="py-2 px-4">
              Login
            </Button>
          )}
        </div>

        <div className="md:hidden">
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
        
        {isAdmin && (
          <Link 
            href="/dashboardAdmin" 
            className={`py-2 transition-colors ${isActiveLink("/dashboard")}`}
            onClick={() => setToggle(false)}
          >
            Dashboard
          </Link>
        )}
        
        {currentUserID ? (
          <>
            <Link 
              href="/profile" 
              className={`py-2 transition-colors ${isActiveLink("/profile")}`}
              onClick={() => setToggle(false)}
            >
              Profile
            </Link>
            <button
              onClick={async () => {
                await logoutUser();
                setToggle(false);
              }}
              className="text-left py-2 text-slate-600 hover:text-slate-800 transition-colors flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>
          </>
        ) : (
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
    </>
  );
};

export default Navbar;