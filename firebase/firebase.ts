import {initializeApp} from "firebase/app";
import {getAuth, GoogleAuthProvider, signInWithPopup} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAOmRX5EEjZUq10Yme5sh0Dbf7w0JG2w1E",
  authDomain: "tip2025-2c283.firebaseapp.com",
  projectId: "tip2025-2c283",
  storageBucket: "tip2025-2c283.firebasestorage.app",
  messagingSenderId: "109890405299",
  appId: "1:109890405299:web:3815c8e10b006e1bcd01c6",
  measurementId: "G-7NRKS17D38"
};

const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({prompt: "select_account"});

const auth = getAuth();

export const signInWithGooglePopup = () =>
	signInWithPopup(auth, googleProvider);
