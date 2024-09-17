// Importing necessary hooks and functions
import { useContext, useEffect, useState } from "react"; // React hooks for context, state, and effects
import logo from "../assets/chatsnap.png";
import { AppContext } from "../context/AppContext"; // Importing the app-wide context
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore"; // Firestore methods for document handling
import { db } from "../config/firebase"; // Importing Firestore instance
import upload from "../lib/upload"; // Importing custom upload function
import { BsSendFill } from "react-icons/bs";
import { GrGallery } from "react-icons/gr";
import { FaAngleDoubleLeft } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";
// ChatBox component
export default function ChatBox() {
  // Destructuring values from AppContext to get and update global state
  const {
    userData,
    messagesId,
    chatUser,
    messages,
    setMessages,
    chatVisible,
    setChatVisible,
  } = useContext(AppContext);

  // State for storing message input
  const [input, setInput] = useState("");

  // Function to send a text message
  const sendMessage = async () => {
    try {
      // Check if there is input and a valid messagesId
      if (input && messagesId) {
        // Add the new message to the Firestore document for the current chat
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id, // Sender ID
            text: input, // Message content
            createdAt: new Date(), // Timestamp for when the message was created
          }),
        });

        // Update chat data for both users involved in the chat
        const userIDs = [chatUser.rId, userData.id]; // Array of user IDs (recipient and sender)
        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, "chats", id); // Reference to the user's chat document
          const userChatsSnapshot = await getDoc(userChatsRef); // Fetch the chat data

          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data(); // Get the chat data

            // Find the chat by its message ID and update the last message
            const chatIndex = userChatData.chatsData.findIndex(
              (c) => c.messageId === messagesId
            );
            userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30); // Set the last message (first 30 characters)
            userChatData.chatsData[chatIndex].updatedAt = Date.now(); // Set the updated timestamp

            // Mark message as unseen if the recipient is the current user
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }

            // Update the chat document in Firestore
            await updateDoc(userChatsRef, {
              chatsData: userChatData.chatsData,
            });
          }
        });
      }
    } catch (error) {
      console.error(error); // Log any errors
    }
    setInput(""); // Clear the input after sending the message
  };

  // Function to send an image message
  const sendImage = async (e) => {
    try {
      const fileUrl = await upload(e.target.files[0]); // Upload the image and get its URL
      if (fileUrl && messagesId) {
        // Add the image message to the Firestore document for the current chat
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id, // Sender ID
            image: fileUrl, // Image URL
            createdAt: new Date(), // Timestamp for when the image was sent
          }),
        });

        // Update chat data for both users involved in the chat
        const userIDs = [chatUser.rId, userData.id]; // Array of user IDs
        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, "chats", id); // Reference to the user's chat document
          const userChatsSnapshot = await getDoc(userChatsRef); // Fetch the chat data

          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data(); // Get the chat data

            // Find the chat by its message ID and update the last message to "Image"
            const chatIndex = userChatData.chatsData.findIndex(
              (c) => c.messageId === messagesId
            );
            userChatData.chatsData[chatIndex].lastMessage = "Image"; // Set last message as "Image"
            userChatData.chatsData[chatIndex].updatedAt = Date.now(); // Set updated timestamp

            // Mark message as unseen if the recipient is the current user
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }

            // Update the chat document in Firestore
            await updateDoc(userChatsRef, {
              chatsData: userChatData.chatsData,
            });
          }
        });
      }
    } catch (error) {
      console.error(error); // Log any errors
    }
  };

  // Function to convert Firebase timestamp to a readable format
  const convertTimestamp = (timestamp) => {
    let date = timestamp.toDate(); // Convert Firestore timestamp to JS Date
    const hour = date.getHours(); // Get the hour
    const minute = date.getMinutes(); // Get the minutes
    if (hour > 12) {
      return hour - 12 + ":" + minute + " PM"; // Convert to PM if hour is greater than 12
    } else {
      return hour + ":" + minute + " AM"; // Convert to AM if hour is less than 12
    }
  };

  // useEffect to listen for real-time updates to messages for the current chat
  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, "messages", messagesId), (res) => {
        setMessages(res.data().messages.reverse()); // Set messages in reverse order for display
      });
      return () => {
        unSub(); // Cleanup the subscription when component unmounts
      };
    }
  }, [messagesId]); // Effect depends on messagesId, so it re-runs when messagesId changes

  // If chatUser is available, display the chat box
  return chatUser ? (
    <div
      className={`chat-box w-full ${
        chatVisible ? "" : "hidden"
      } md:block h-[85vh] relative bg-offwhite`}
    >
      {/* Top Part of Chat Box: User Info */}
      <div className="chat-user py-[10px] px-[15px] flex items-center gap-[10px] border-b border-b-[#c6c6c6]">
        {/* User Avatar */}
        <img
          className="w-[38px] rounded-full aspect-[1/1]"
          src={chatUser.userData.avatar} // Display user's avatar
          alt=""
        />
        {/* User Name and Online Indicator */}
        <p className="flex-1 font-medium text-xl text-[#393939] flex items-center gap-[5px]">
          {chatUser.userData.name}

          {/* Online indicator: if lastSeen is less than 70 seconds ago */}
          {Date.now() - chatUser.userData.lastSeen <= 70000 ? (
            <GoDotFill className="text-green-600" />
          ) : null}
        </p>

        {/* Help Icon and Back Arrow for mobile */}

        <FaAngleDoubleLeft
          className="md:hidden text-3xl text-orange"
          onClick={() => setChatVisible(false)}
        />
      </div>

      {/* Middle Part: Messages */}
      <div className="h-[calc(100%-70px)] pb-[50px] overflow-y-scroll flex flex-col-reverse">
        {messages.map((msg, index) => {
          return (
            // Sender or Receiver Message Layout
            <div
              key={index}
              className={
                msg.sId === userData.id ? "sender-msg" : "receiver-msg"
              }
            >
              {/* If the message contains an image */}
              {msg["image"] ? (
                <img
                  className="max-w-[230px] mb-[30px] rounded-[10px]"
                  src={msg.image} // Display the image
                  alt=""
                />
              ) : (
                // Display the text message
                <p className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
                  {msg.text}
                </p>
              )}

              {/* Message timestamp and avatar */}
              <div className="text-[9px] text-center">
                <img
                  className="w-[27px] aspect-[1/1] rounded-full"
                  src={
                    msg.sId === userData.id
                      ? userData.avatar // Sender's avatar
                      : chatUser.userData.avatar // Receiver's avatar
                  }
                  alt=""
                />
                <p>{convertTimestamp(msg.createdAt)}</p>{" "}
                {/* Format the timestamp */}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Part: Input Field and Send Button */}
      <div className="chat-input flex items-center gap-3 px-[15px] py-[10px] bg-white absolute bottom-0 left-0 right-0">
        {/* Input for typing message */}
        <input
          className="flex-1 outline-none"
          type="text"
          placeholder="Send a message"
          onChange={(e) => {
            setInput(e.target.value); // Set the input when typing
          }}
          value={input} // Display the input value
        />

        {/* Hidden file input for sending images */}
        <input
          type="file"
          id="image"
          accept="image/png, image/jpeg"
          hidden
          onChange={sendImage} // Trigger sendImage when an image is selected
        />

        {/* Image upload button */}
        <label className="flex" htmlFor="image">
          <GrGallery className="text-xl cursor-pointer text-[#808080]" />
        </label>

        {/* Send message button */}
        <BsSendFill
          onClick={sendMessage}
          className="text-2xl cursor-pointer text-orange"
        />
      </div>
    </div>
  ) : (
    // If no chatUser is selected, display a welcome screen
    <div
      className={`chat-welcome ${
        chatVisible ? "" : "hidden"
      } w-full md:flex flex-col items-center justify-center gap-[5px]`}
    >
      <img className="w-[80px]" src={logo} alt="" /> {/* Logo */}
      <p className="text-xl font-medium text-[#383838]">
        Chat anytime, anywhere
      </p>
    </div>
  );
}
