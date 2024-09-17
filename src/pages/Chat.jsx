// Importing necessary hooks and components
import { useContext, useEffect, useState } from "react"; // React hooks: useContext for context, useEffect for lifecycle management, and useState for state handling
import ChatBox from "../components/ChatBox"; // Importing the ChatBox component
import LeftSidebar from "../components/LeftSidebar"; // Importing the LeftSidebar component
import RightSidebar from "../components/RightSidebar"; // Importing the RightSidebar component
import { AppContext } from "../context/AppContext"; // Importing AppContext to get global state data

// Chat component
export default function Chat() {
  // Destructuring chatData and userData from AppContext
  const { chatData, userData } = useContext(AppContext);

  // Local state 'loading' to track whether chat data and user data are fully loaded
  const [loading, setLoading] = useState(true);

  // useEffect hook to monitor changes in chatData and userData. When both are available, set loading to false
  useEffect(() => {
    if (chatData && userData) {
      setLoading(false); // Set loading to false once the data is ready
    }
  }, [chatData, userData]); // Dependency array ensures the effect runs when either chatData or userData changes

  return (
    // Main container for the chat page with a background gradient, centered content
    <div className="min-h-screen bg-aqua grid place-items-center">
      {/* Chat container */}
      {/* Show a loading message if data is still being loaded, else render the chat interface */}
      {loading ? (
        // Display loading text while chatData and userData are still loading
        <p className="text-[30px] md:text-[50px] text-white">Loading...</p>
      ) : (
        // Once loading is complete, display the chat layout with sidebars and chatbox
        <div className="w-[95%] h-[85vh] rounded-xl max-w-[1000px] bg-offwhite flex md:grid md:grid-flow-col md:grid-cols-[1fr_2fr_1fr]">
          {/* LeftSidebar component: typically for user info or navigation */}
          <LeftSidebar />

          {/* Main chat area */}
          <ChatBox />

          {/* RightSidebar component: often for extra features like user settings or contacts */}
          <RightSidebar />
        </div>
      )}
    </div>
  );
}
