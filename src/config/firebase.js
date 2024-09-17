// Importing Firebase modules
import { initializeApp } from "firebase/app"; // Initialize Firebase app
import {
  createUserWithEmailAndPassword, // Create user with email and password
  getAuth, // Firebase authentication service
  sendPasswordResetEmail, // Send email to reset password
  signInWithEmailAndPassword, // Sign in user with email and password
  signOut, // Sign out the current user
} from "firebase/auth"; // Firebase Authentication methods

import {
  collection, // Reference to Firestore collections
  doc, // Reference to a document in Firestore
  getDocs, // Get multiple documents from a collection
  getFirestore, // Initialize Firestore instance
  query, // Create a query to filter data in Firestore
  setDoc, // Create or update a document in Firestore
  where, // Create a query condition for Firestore
} from "firebase/firestore"; // Firestore methods for database interactions

import { toast } from "react-toastify"; // Toast notifications for success/error messages

// Firebase configuration for your project
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase app with the provided configuration
const app = initializeApp(firebaseConfig);

// Initialize Firebase services: authentication and Firestore database
const auth = getAuth(app);
const db = getFirestore(app);

// Function to handle user signup
// It receives the username, email, and password from the form
const signup = async (username, email, password) => {
  try {
    // Create a new user with email and password using Firebase Authentication
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user; // Get the user object from the response

    // Add user details to Firestore 'users' collection
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid, // Store the user UID
      username: username.toLowerCase(), // Store the username in lowercase
      email: email, // Store the email
      name: "", // Empty name (to be updated later by the user)
      avatar: "", // Empty avatar (to be updated later)
      bio: "Hey, There i am using chatsnap", // Default bio for the user
      lastSeen: Date.now(), // Timestamp of the last time the user was active
    });

    // Create an empty chat list for the new user in the 'chats' collection
    await setDoc(doc(db, "chats", user.uid), {
      chatsData: [], // Initialize an empty chat data array
    });

    toast.success("You can now Login"); // Notify the user of successful signup
  } catch (error) {
    console.error(error); // Log the error
    toast.error(error.code.split("/")[1].split("-").join(" ")); // Display error message using toast
  }
};

// Function to handle user login
const login = async (email, password) => {
  try {
    // Sign in the user with the provided email and password
    await signInWithEmailAndPassword(auth, email, password);
    toast.success("You are Logged in"); // Notify the user of successful login
  } catch (error) {
    console.error(error); // Log the error
    toast.error(error.code.split("/")[1].split("-").join(" ")); // Display error message using toast
  }
};

// Function to handle user logout
const logout = async () => {
  try {
    // Sign out the current user
    await signOut(auth);
  } catch (error) {
    console.error(error); // Log the error
    toast.error(error.code.split("/")[1].split("-").join(" ")); // Display error message using toast
  }
};

// Function to handle password reset
const resetPass = async (email) => {
  // Check if email is provided
  if (!email) {
    toast.error("Enter your email"); // Notify the user to enter an email
    return null;
  }
  try {
    // Create a reference to the 'users' collection
    const userRef = collection(db, "users");

    // Create a query to find the user by email
    const q = query(userRef, where("email", "==", email));

    // Get the documents that match the query
    const querySnap = await getDocs(q);

    // If the email exists in the database
    if (!querySnap.empty) {
      // Send a password reset email
      await sendPasswordResetEmail(auth, email);
      toast.success("Reset email sent"); // Notify the user of successful email send
    } else {
      // If no user is found with the provided email
      toast.error("Email doesn't exists"); // Notify the user that the email does not exist
    }
  } catch (error) {
    console.error(error); // Log the error
    toast.error(error.message); // Display error message using toast
  }
};

// Exporting the Firebase functions and services for use in other parts of the app
export { signup, login, logout, resetPass, auth, db };
