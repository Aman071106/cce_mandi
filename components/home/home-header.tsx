"use client";

import React, { useContext } from "react";
import Link from "next/link";
import LoginButton from "@/components/button/LoginButton";
import { UserContext } from "@/context/user-context";
import { useRouter } from "next/navigation";
import { signInWithGooglePopup } from "@/firebase/firebase";
import { createUserDoc } from "@/lib/actions";
import toast from "react-hot-toast";
import { setUserCookie } from "@/lib/server-actions";

const styles = {
  boxWidth: "xl:max-w-[1280px] w-full",
  heading1: "font-mono font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-tight sm:leading-snug",
  heading2: "font-mono font-semibold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-snug",
  heading3: "font-mono font-medium text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white leading-snug",
  paragraph: "font-mono font-bold text-gray-300 text-base sm:text-lg md:text-xl leading-6 sm:leading-8",

  flexCenter: "flex justify-center items-center",
  flexStart: "flex justify-center items-start",
  paddingX: "sm:px-16 px-6",
  paddingY: "sm:py-16 py-6",
  padding: "sm:px-16 px-6 sm:py-12 py-4",
  marginX: "sm:mx-16 mx-6",
  marginY: "sm:my-16 my-6",
};

const HomeHeader: React.FC = () => {
  const { currentUserID, setCurrentUserID } = useContext(UserContext);
  const router = useRouter();

  const loginUser = async () => {
    try {
      const { user } = await signInWithGooglePopup();
      if (user.email) {
        setCurrentUserID(user.uid);
        await createUserDoc(user);
        await setUserCookie(user.uid);
        toast.success("Signed in successfully!- home");
        router.push("/profile");
      } else {
        toast.error("Please login with your institute ID.");
        router.push("/");
      }
    } catch (e) {
      toast.error("Error signing in. Check console.");
      console.log(e);
    }
  };

  return (
    <section id="home" className="relative w-full min-h-screen flex flex-col justify-center items-center">
      <div className={`absolute inset-0 ${styles.flexCenter} flex-col ${styles.paddingX} py-12 text-white`}>
        {/* Background with Image */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-black">
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage: `url('https://cce.iitmandi.ac.in/images/heroimg.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 via-transparent to-indigo-900/40"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80"></div>
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='grid' width='100' height='100' patternUnits='userSpaceOnUse'%3e%3cpath d='M 100 0 L 0 0 0 100' fill='none' stroke='%2364748b' stroke-width='1'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23grid)'/%3e%3c/svg%3e")`,
            }}
          ></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-start sm:items-start px-6 sm:px-16 max-w-6xl w-full">
          <div className="w-full flex justify-start py-[6px] px-0 bg-discount-gradient rounded-[10px] mb-6">
            <p className={styles.heading1}>
              <span className="text-white font-semibold">Center of Continuing Education</span> at{" "}
              <span className="text-white font-semibold">IIT Mandi</span>
            </p>
          </div>

          <div className="flex flex-row justify-between items-center w-full">
            <div className="flex flex-col">
              <h1 className={`${styles.heading2} mb-4`}>
                Bridging <br className="sm:block hidden" />
                <span className="text-gradient">Academia & Industry</span>
              </h1>
            </div>
          </div>

          <p className={`${styles.paragraph} max-w-[650px] mt-6 mb-10`}>
            The Center of Continuing Education at IIT Mandi is dedicated to fostering continuous professional development,
            knowledge exchange, and industry-academia collaboration through cutting-edge programs and workshops.
          </p>

          {/* Dynamic Login/Profile Button */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full sm:w-auto">
            {currentUserID ? (
              <Link href="/profile">
                <LoginButton>Profile</LoginButton>
              </Link>
            ) : (
              <LoginButton onClick={loginUser}>Login</LoginButton>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default HomeHeader;
