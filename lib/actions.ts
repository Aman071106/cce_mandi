import { User } from "firebase/auth";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import toast from "react-hot-toast";
import emailjs from "@emailjs/browser";
import { eventData } from "./event-data";

export const createUserDoc = async (userDoc: User) => {
  const userDocRef = doc(db, "users", userDoc.uid);
  const userSnapshot = await getDoc(userDocRef);

  if (!userSnapshot.exists()) {
    const { displayName, email, photoURL } = userDoc;
    let registeredEvents: string[] = [];

    try {
      await setDoc(userDocRef, {
        displayName,
        email,
        photoURL,
        registeredEvents,
      });
    } catch (e) {
      toast.error("Unexpected error. More info in console");
      console.log(e);
    }
  }
  return userDocRef;
};

export const getUserDoc = async (userID: string) => {
  const userDocRef = doc(db, "users", userID);
  const userSnapshot = await getDoc(userDocRef);

  if (!userSnapshot.exists()) {
    toast.error("User not found!");
    throw new Error("User not found");
  }
  return userSnapshot.data();
};


export const registerUserInMailingList = async (
  eventID: string,
  userID: string,
) => {
  const eventRef = doc(db, "events", eventID);
  const userSnapshot = await getDoc(doc(db, "users", userID));

  if (!userSnapshot.exists()) {
    toast.error("User not found!");
    return;
  }

  const userData = userSnapshot.data() as {
    displayName: string;
    email: string;
  };

  // Firestore update
  await updateDoc(eventRef, {
    registered: arrayUnion(userData.email),
  });

  // Get event name from eventData
  const event = eventData.find((e) => e.id === eventID);
  const eventName = event?.name || eventID;

  // Send confirmation email
  try {
    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      {
        to_email: userData.email,
        to_name: userData.displayName || "Participant",
        event_name: eventName,
      },
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!,
    );
    toast.success(`Confirmation email sent for ${eventName}`);
  } catch (error) {
    console.error("Error sending email:", error);
    toast.error("Could not send confirmation email");
  }
};

export const unregisterUserFromMailingList = async (
  eventID: string,
  userID: string,
) => {
  const eventRef = doc(db, "events", eventID);
  const userSnapshot = await getDoc(doc(db, "users", userID));
  if (userSnapshot.exists()) {
    await updateDoc(eventRef, {
      registered: arrayRemove(userSnapshot.data().email),
    });
  } else {
    toast.error("User not found!");
  }
};
