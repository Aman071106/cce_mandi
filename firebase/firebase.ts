import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { destroyCookie } from "@/lib/server-actions"; // adjust path to where your destroyCookie lives

const firebaseConfig = {
  apiKey: "AIzaSyBcB-J1Zw8TZpSsVJxpRuCINJjACe0srbw",
  authDomain: "ccemandi-33e63.firebaseapp.com",
  projectId: "ccemandi-33e63",
  storageBucket: "ccemandi-33e63.firebasestorage.app",
  messagingSenderId: "805421299054",
  appId: "1:805421299054:web:833eab509105087ffc3d7f",
  measurementId: "G-5MQ359M73G",
};

const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const auth = getAuth(firebaseApp);

export const signInWithGooglePopup = () => signInWithPopup(auth, googleProvider);

/**
 * Signs the user out of Firebase AND removes user cookie.
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);           // Firebase sign-out
    await destroyCookie();         // Remove user_id cookie
    return true;
  } catch (error) {
    console.error("Error signing out:", error);
    return false;
  }
};
