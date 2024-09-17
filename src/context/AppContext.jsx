// Importing necessary Firebase Firestore methods and React hooks
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore"; // Firestore methods to get, update, and listen to document changes
import { createContext, useEffect, useState } from "react"; // React hooks for context creation and state management
import { auth, db } from "../config/firebase"; // Firebase authentication and Firestore database instance
import { useNavigate } from "react-router-dom"; // React Router hook for navigation

// Creating a context for managing global app state
export const AppContext = createContext();

const AppContextProvider = (props) => {
  const navigate = useNavigate(); // Hook to handle navigation programmatically
  const [userData, setUserData] = useState(null); // State to store current user's data
  const [chatData, setChatData] = useState(null); // State to store chat data (chat list)
  const [messagesId, setMessagesId] = useState(null); // State to store current chat's message ID
  const [messages, setMessages] = useState([]); // State to store current chat messages
  const [chatUser, setChatUser] = useState(null); // State to store the selected chat user (recipient)
  const [chatVisible, setChatVisible] = useState(false); // State to handle chat visibility

  // Function to load user data based on user ID
  // If user has avatar and name, navigate to chat, else navigate to profile update
  const loadUserData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid); // Reference to the user's document in Firestore
      const userSnap = await getDoc(userRef); // Fetch the user's data from Firestore
      const userData = userSnap.data(); // Get the user's data from the snapshot
      setUserData(userData); // Set the user data in state

      // Navigate to chat if both avatar and name are present, else navigate to profile update
      if (userData.avatar && userData.name) {
        navigate("/chat");
      } else {
        navigate("/profile");
      }

      // Update the last seen time of the user in Firestore
      await updateDoc(userRef, {
        lastSeen: Date.now(),
      });

      // Set an interval to update the user's last seen time every minute
      setInterval(async () => {
        if (auth.chatUser) {
          await updateDoc(userRef, {
            lastSeen: Date.now(),
          });
        }
      }, 60000); // 60,000 ms = 60 seconds (1 minute)
    } catch (error) {
      console.error(error); // Log any errors during user data fetching
    }
  };

  // Effect to listen for changes in chat data once the user data is loaded
  useEffect(() => {
    if (userData) {
      const chatRef = doc(db, "chats", userData.id); // Reference to the current user's chat document in Firestore
      const unSub = onSnapshot(chatRef, async (res) => {
        const data = res.data(); // Get the chat data from the snapshot

        // Check if the data exists and if chatsData is an array
        if (!data || !Array.isArray(data.chatsData)) {
          console.error("chatsData is not an array or is undefined", data);
          return;
        }

        const chatItems = data.chatsData; // List of chats from Firestore
        const tempData = [];

        // Loop through each chat item and fetch the corresponding user data for the chat recipient
        for (const item of chatItems) {
          const userRef = doc(db, "users", item.rId); // Reference to the chat recipient's user document
          const userSnap = await getDoc(userRef); // Fetch the recipient's user data
          const userData = userSnap.data(); // Get the recipient's user data
          tempData.push({ ...item, userData }); // Combine chat item with the user data and push it into tempData
        }

        // Sort the chat data by the most recently updated chat and update state
        setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
      });

      // Clean up the subscription to Firestore updates when the component unmounts or userData changes
      return () => {
        unSub();
      };
    }
  }, [userData]); // The effect depends on userData, so it re-runs when userData changes

  // Values that are shared across the app using the context provider
  const value = {
    userData,
    setUserData,
    chatData,
    setChatData,
    loadUserData, // Function to load user data and handle profile redirection
    messages,
    setMessages,
    messagesId,
    setMessagesId,
    chatUser,
    setChatUser,
    chatVisible,
    setChatVisible,
  };

  return (
    // Providing the context values to all child components
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider; // Exporting the AppContextProvider component
