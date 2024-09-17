// Importing necessary hooks and functions
import { useContext, useEffect, useState } from "react"; // React hooks for state management and side effects
import { logout } from "../config/firebase"; // Firebase logout function
import { AppContext } from "../context/AppContext"; // Importing context to access global state

// RightSidebar component
export default function RightSidebar() {
  // Destructuring chatUser and messages from AppContext to access the current chat user's data and messages
  const { chatUser, messages } = useContext(AppContext);

  // State to store images sent in the chat messages
  const [msgImages, setMsgImages] = useState([]);

  // useEffect to filter out images from the chat messages whenever the 'messages' state changes
  useEffect(() => {
    let tempVar = [];
    messages.map((msg) => {
      if (msg.image) {
        // If the message contains an image, add it to the temporary array
        tempVar.push(msg.image);
      }
    });
    setMsgImages(tempVar); // Update the state with the filtered images
  }, [messages]); // Re-run the effect whenever 'messages' changes

  // Conditional rendering: if 'chatUser' is available, display the right sidebar with user profile info and media gallery
  return chatUser ? (
    <div className="rs hidden md:block md:text-white md:bg-darkteal md:rounded-xl md:relative md:h-[85vh] md:overflow-y-scroll">
      {/* User Profile Section */}
      <div className="rs-profile pt-[60px] text-center max-w-[70%] m-auto flex items-center flex-col">
        {/* Displaying chat user's profile picture */}
        <img
          className="w-[110px] aspect-[1/1] rounded-full"
          src={chatUser.userData.avatar} // User's avatar (profile picture)
          alt=""
        />

        {/* Displaying chat user's name with an online/offline indicator */}
        <h3 className="text-lg font-normal flex items-center justify-center gap-1 my-[5px]">
          {/* If the user was active in the last 70 seconds, show a green dot (online indicator) */}
          {chatUser.userData.name} {/* Display the chat user's name */}
        </h3>

        {/* Displaying chat user's bio */}
        <p className="text-[10px] opacity-80 font-light">
          {chatUser.userData.bio}
        </p>
      </div>

      {/* Horizontal line separating profile section from media section */}
      <hr className="border-[#ffffff50] my-[15px]" />

      {/* Media section for displaying images shared in the chat */}
      <div className="rs-media px-5 text-[13px]">
        <p>Media</p>
        {/* Media gallery: displaying images shared in the chat */}
        <div className="max-h-[180px] overflow-y-scroll grid grid-cols-3 gap-[5px] mt-2">
          {msgImages.map((url, index) => (
            <img
              key={index} // Each image needs a unique key
              className="w-[60px] rounded cursor-pointer"
              src={url} // The image URL
              alt=""
              onClick={() => window.open(url)} // Open the image in a new tab when clicked
            />
          ))}
        </div>
      </div>

      {/* Logout button */}
      <button className="logout-btn" onClick={() => logout()}>
        Logout
      </button>
    </div>
  ) : (
    // If 'chatUser' is not available, only display the logout button
    <div className="rs hidden md:block md:text-white md:bg-darkteal md:rounded-xl md:relative md:h-[85vh] md:overflow-y-scroll">
      <button className="logout-btn" onClick={() => logout()}>
        Logout
      </button>
    </div>
  );
}
