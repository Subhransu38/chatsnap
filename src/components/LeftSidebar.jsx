// Importing necessary modules and hooks
import { useNavigate } from "react-router-dom"; // Hook for navigation
import logo from "../assets/chatsnap.png";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore"; // Firestore methods for handling chats, messages, and users
import { db, logout } from "../config/firebase"; // Firebase Firestore and authentication (logout) methods
import { AppContext } from "../context/AppContext"; // App-wide context for managing state
import { useContext, useEffect, useState } from "react"; // React hooks for context, state, and side-effects
import { toast } from "react-toastify"; // Notification system for user feedback
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { FaSearch } from "react-icons/fa";
// LeftSidebar component
export default function LeftSidebar() {
  const navigate = useNavigate(); // useNavigate hook for programmatic navigation
  const {
    userData,
    chatData,
    chatUser,
    setChatUser,
    setMessagesId,
    messagesId,
    chatVisible,
    setChatVisible,
  } = useContext(AppContext); // Accessing the app-wide context for managing chat and user data
  const [user, setUser] = useState(null); // State to manage search results (new user)
  const [showSearch, setShowSearch] = useState(false); // State to manage whether the search results are displayed

  // Handler for the search input (search for a user by username)
  const inputHandler = async (e) => {
    try {
      const input = e.target.value;
      if (input) {
        setShowSearch(true); // Show the search results if the input is non-empty
        const userRef = collection(db, "users"); // Reference to the users collection in Firestore
        const q = query(userRef, where("username", "==", input.toLowerCase())); // Query to find the user by username
        const querySnap = await getDocs(q); // Execute the query

        // If a user is found and it's not the current user
        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          let userExist = false;
          chatData.map((user) => {
            if (user.rId === querySnap.docs[0].data().id) {
              userExist = true; // If the user is already in chat, mark as existing
            }
          });
          if (!userExist) {
            setUser(querySnap.docs[0].data()); // Set the user in state if not already in chat
          }
        } else {
          setUser(null); // If no user found, set state to null
        }
      } else {
        setShowSearch(false); // Hide search if input is empty
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Function to add a new chat when clicking on a search result
  const addChat = async () => {
    try {
      // Check if the chat already exists
      let chatExists = false;
      chatData.forEach((chat) => {
        if (chat.rId === user.id) {
          chatExists = true; // If chat already exists, mark it
        }
      });

      if (chatExists) {
        toast.info("Chat already exists!"); // If the chat exists, notify the user
        return;
      }

      const messagesRef = collection(db, "messages"); // Reference to messages collection
      const chatsRef = collection(db, "chats"); // Reference to chats collection
      const newMessageRef = doc(messagesRef); // Create a new document reference for the new message

      // Set an empty message document for the new chat
      await setDoc(newMessageRef, {
        createAt: serverTimestamp(),
        messages: [],
      });

      // Update the new user's chat data with the new chat
      await updateDoc(doc(chatsRef, user.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: userData.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });

      // Update the current user's chat data with the new chat
      await updateDoc(doc(chatsRef, userData.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: user.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });

      // Fetch and set the chat user data for the newly added chat
      const uSnap = await getDoc(doc(db, "users", user.id));
      const uData = uSnap.data();
      setChat({
        messagesId: newMessageRef.id,
        lastMessage: "",
        rId: user.id,
        updatedAt: Date.now(),
        messageSeen: true,
        userData: uData,
      });
      setShowSearch(false); // Hide the search results after adding chat
      setChatVisible(true); // Make the chat window visible
    } catch (error) {
      console.error("Error adding chat: ", error);
    }
  };

  // Function to handle when a chat is selected from the chat list
  const setChat = async (item) => {
    try {
      setMessagesId(item.messageId); // Set the current messageId
      setChatUser(item); // Set the current chat user

      // Fetch the user's chat document from Firestore
      const userChatsRef = doc(db, "chats", userData.id);
      const userChatsSnapshot = await getDoc(userChatsRef);
      const userChatsData = userChatsSnapshot.data();

      // Find the chat in the chatsData array and update the 'messageSeen' property
      const chatIndex = userChatsData.chatsData.findIndex(
        (c) => c.messageId === item.messageId
      );

      if (chatIndex !== -1) {
        userChatsData.chatsData[chatIndex].messageSeen = true;

        // Update the chat document in Firestore
        await updateDoc(userChatsRef, {
          chatsData: userChatsData.chatsData,
        });
      } else {
        toast.error("Chat not found");
      }

      setChatVisible(true); // Make the chat window visible
    } catch (error) {
      toast.error(error.message); // Notify the user if there's an error
    }
  };

  // useEffect to update chat user data whenever chatUser or chatData changes
  useEffect(() => {
    const updateChatUserData = async () => {
      if (chatUser) {
        const userRef = doc(db, "users", chatUser.userData.id);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        setChatUser((prev) => ({ ...prev, userData: userData })); // Update the userData for the selected chat user
      }
    };
    updateChatUserData();
  }, [chatData]); // Re-run the effect when chatData changes

  return (
    <div
      className={`ls w-full ${
        chatVisible ? "hidden" : ""
      } md:block bg-darkteal rounded-xl text-white h-[85vh] overflow-hidden`}
    >
      {/* Sidebar Top */}
      <div className="ls-top p-5">
        {/* Navigation */}
        <div className="ls-nav flex justify-between items-center">
          <p className="flex gap-3">
            <img className="max-w-8" src={logo} alt="" />{" "}
            <span className="font-semibold text-xl">ChatSnap</span>
          </p>

          <div className="menu group relative py-[10px]">
            <PiDotsThreeOutlineVerticalFill className="text-xl cursor-pointer" />
            <div className="sub-menu group-hover:block absolute top-full right-0 w-[130px] p-5 rounded-[5px] bg-white text-black hidden">
              <p
                className="cursor-pointer text-sm"
                onClick={() => navigate("/profile")} // Navigate to the profile page
              >
                Edit Profile
              </p>
              <hr className="h-[1px] bg-[#a4a4a4] my-2" />
              <p onClick={() => logout()} className="cursor-pointer text-sm">
                Logout
              </p>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="ls-search bg-aqua rounded-full flex items-center gap-[10px] py-[10px] px-3 mt-5 ">
          <FaSearch className="w-4" />
          {/* Search Icon */}
          <input
            className="bg-transparent outline-none text-black text-xs placeholder:text-gray"
            type="text"
            placeholder="Search here.."
            onChange={inputHandler} // Input handler for searching users
          />
        </div>
      </div>

      {/* Chat List or Search Results */}
      <div className="ls-list flex flex-col h-[70%] overflow-y-scroll">
        {showSearch && user ? (
          <div
            className="friends add-user group flex items-center gap-[10px] py-[10px] px-5 cursor-pointer text-[13px] hover:bg-orange"
            onClick={addChat} // Add chat when user is clicked
          >
            <img
              className="w-[35px] aspect-[1/1] rounded-full"
              src={user.avatar}
              alt=""
            />
            <p>{user.name}</p>
          </div>
        ) : (
          // List of existing chats
          chatData?.map((item, index) => (
            <div
              onClick={() => {
                setChat(item); // Set chat when clicked
              }}
              key={index}
              className={`friends group flex items-center gap-[10px] py-[10px] px-5 cursor-pointer text-[13px] hover:bg-orange ${
                item.messageSeen || item.messageId === messagesId
                  ? ""
                  : "border"
              }`}
            >
              <img
                className="w-[35px] aspect-[1/1] rounded-full"
                src={item.userData.avatar}
                alt=""
              />
              <div className="flex flex-col ">
                <p>{item.userData.name}</p>
                <span className="text-[#9f9f9f] text-[11px] group-hover:text-white">
                  {item.lastMessage}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
