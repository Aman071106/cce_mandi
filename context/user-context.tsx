"use client";

import React, { createContext, ReactNode, useEffect, useState } from "react";
import { getUserCookie } from "@/lib/server-actions";
import toast from "react-hot-toast";

interface Props {
  children: ReactNode;
}

export const UserContext = createContext<{
  currentUserID: string | null;
  setCurrentUserID: (userID: string | null) => void;
}>({
  currentUserID: null,
  setCurrentUserID: () => null,
});

const UserProvider = ({ children }: Props) => {
  const [currentUserID, setCurrentUserID] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const userData = await getUserCookie();
      
      if (userData) {
        setCurrentUserID(userData.value);
        // toast.success("Welcome back!- debug");
      }
    })();
  }, []);

  const value = { currentUserID, setCurrentUserID };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserProvider;
