// Importing necessary modules and components
import { Route, Routes, useNavigate } from "react-router-dom"; // React Router for handling navigation and routes
import Login from "./pages/Login"; // Login component
import Chat from "./pages/Chat"; // Chat component
import ProfileUpdate from "./pages/ProfileUpdate"; // Profile Update component
import { ToastContainer } from "react-toastify"; // Toast container for notifications
import "react-toastify/dist/ReactToastify.css"; // Importing Toastify CSS for notifications
import { useContext, useEffect } from "react"; // React hooks for context and lifecycle methods
import { onAuthStateChanged } from "firebase/auth"; // Firebase method for tracking authentication state
import { auth } from "./config/firebase"; // Firebase auth instance
import { AppContext } from "./context/AppContext"; // App-wide context for managing global state

// Main App component
export default function App() {
  const navigate = useNavigate(); // Hook to handle navigation programmatically
  const { loadUserData } = useContext(AppContext); // Getting loadUserData function from the AppContext

  // useEffect to monitor Firebase authentication state changes
  useEffect(() => {
    // Listen for authentication state changes
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // If the user is authenticated, navigate to the chat page
        navigate("/chat");
        await loadUserData(user.uid); // Load the authenticated user's data using the loadUserData function
      } else {
        // If no user is authenticated, navigate to the login page
        navigate("/");
      }
    });
  }, []); // Empty dependency array ensures this effect runs only once, when the component mounts

  return (
    <>
      {/* Toast container for showing notifications */}
      <ToastContainer />

      {/* Route configuration for the application */}
      <Routes>
        {/* Route for the Login page */}
        <Route path="/" element={<Login />} />

        {/* Route for the Chat page */}
        <Route path="/chat" element={<Chat />} />

        {/* Route for the Profile Update page */}
        <Route path="/profile" element={<ProfileUpdate />} />
      </Routes>
    </>
  );
}
