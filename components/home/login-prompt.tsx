"use client";

import React, { useContext } from "react";
import Button from "@/components/button/button";
import GoogleLogo from "@/public/google.png";
import Image from "next/image";
import Link from "next/link";
import { signInWithGooglePopup } from "@/firebase/firebase";
import { createUserDoc } from "@/lib/actions";
import { UserContext } from "@/context/user-context";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { setUserCookie } from "@/lib/server-actions";

const LoginPrompt = () => {
  const { currentUserID, setCurrentUserID } = useContext(UserContext);
  const router = useRouter();

  const loginUser = async () => {
    try {
      const { user } = await signInWithGooglePopup();
      if (user.email) {
        setCurrentUserID(user.uid);
        await createUserDoc(user);
        await setUserCookie(user.uid);
        toast.success("Signed in successfully!");
        router.push("/profile");
      }
    } catch (e) {
      toast.error("Error signing in. Check console.");
      console.error(e);
    }
  };

  return (
    <div className="px-6 md:px-12 py-24 flex flex-col items-center md:items-start text-center md:text-left">
      <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6 text-slate-900">
        Welcome! Please login to continue
      </h1>
      <p className="text-lg md:text-xl text-gray-500 mb-12 max-w-screen-sm">
        Access your profile and manage your registrations easily.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {!currentUserID ? (
          <Button variant="black" onClick={loginUser} className="flex items-center gap-2">
            <Image src={GoogleLogo} alt="Google logo" width={24} />
            Login with Google
          </Button>
        ) : (
          <Link href="/profile">
            <Button variant="black">Go to Profile</Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default LoginPrompt;
