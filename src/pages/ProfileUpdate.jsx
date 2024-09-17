// Importing necessary modules and hooks
import { useContext, useEffect, useState } from "react"; // Core React hooks
import logo from "../assets/chatsnap.png"; // Importing assets, such as images or logos
import { onAuthStateChanged } from "firebase/auth"; // Firebase authentication state listener
import { auth, db } from "../config/firebase"; // Importing Firebase authentication and Firestore database
import { doc, getDoc, updateDoc } from "firebase/firestore"; // Firestore methods for handling documents
import { useNavigate } from "react-router-dom"; // Hook to handle navigation
import { toast } from "react-toastify"; // Notification system
import upload from "../lib/upload"; // Custom file upload function
import { AppContext } from "../context/AppContext"; // Context to manage global app state
import { PiUserCircleFill } from "react-icons/pi";
// ProfileUpdate component
export default function ProfileUpdate() {
  const navigate = useNavigate(); // Hook to navigate programmatically
  const [image, setImage] = useState(false); // State for handling profile image upload
  const [name, setName] = useState(""); // State for storing user's name
  const [bio, setBio] = useState(""); // State for storing user's bio
  const [uid, setUid] = useState(""); // State for storing user's UID (unique identifier)
  const [prevImage, setPrevImage] = useState(""); // State to store the previously uploaded image URL
  const { setUserData } = useContext(AppContext); // Accessing the global app context to update user data

  // Function to handle profile update form submission
  const profileUpdate = async (e) => {
    e.preventDefault(); // Preventing default form submission behavior
    try {
      // Check if a profile picture is provided
      if (!prevImage && !image) {
        toast.error("Upload Profile Picture"); // Show error if no image is provided
        return; // Exit function if no image
      }

      const docRef = doc(db, "users", uid); // Reference to the user's document in Firestore

      // If an image is uploaded, update the avatar in the user's profile
      if (image) {
        const imgUrl = await upload(image); // Upload the image and get its URL
        setPrevImage(imgUrl); // Set the previous image state to the new image URL
        await updateDoc(docRef, {
          avatar: imgUrl, // Update Firestore with the new avatar URL
          bio: bio, // Update bio in Firestore
          name: name, // Update name in Firestore
        });
      } else {
        // If no new image is uploaded, update only the bio and name
        await updateDoc(docRef, {
          bio: bio,
          name: name,
        });
      }

      toast.success("Profile updated successfully"); // Show success message after update

      const snap = await getDoc(docRef); // Get updated user data from Firestore
      setUserData(snap.data()); // Update the global context with the new user data
      navigate("/chat"); // Navigate to the chat page after successful update
    } catch (error) {
      console.error(error); // Log any errors
      toast.error(error.message); // Show error message using toast
    }
  };

  // useEffect to handle authentication state changes and load user profile data
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid); // Set the UID for the authenticated user
        const docRef = doc(db, "users", user.uid); // Reference to the user's document in Firestore
        const docSnap = await getDoc(docRef); // Fetch the user data from Firestore

        // If the user document exists, load the name, bio, and avatar
        if (docSnap.exists()) {
          if (docSnap.data().name) {
            setName(docSnap.data().name); // Set the name state with the user's name
          }
          if (docSnap.data().bio) {
            setBio(docSnap.data().bio); // Set the bio state with the user's bio
          }
          if (docSnap.data().avatar) {
            setPrevImage(docSnap.data().avatar); // Set the previous image with the user's avatar URL
          }
        }
      } else {
        navigate("/"); // If no user is authenticated, navigate to the home page
      }
    });
  }, []);

  return (
    // Main container with background image, centered content, and profile form
    <div className="profile min-h-screen bg-darkteal bg-no-repeat bg-cover flex items-center justify-center">
      {/* Profile form and image container */}
      <div className="profile-container bg-white flex items-center justify-between min-w-[700px] rounded-[10px]">
        {/* Profile update form */}
        <form className="flex flex-col gap-5 p-10" onSubmit={profileUpdate}>
          <h3 className="font-medium text-lg">Profile Details</h3>

          {/* File upload for profile image */}
          <label
            className="flex items-center gap-[10px] text-gray-500 cursor-pointer"
            htmlFor="avatar"
          >
            {/* Hidden input for image upload */}
            <input
              onChange={(e) => setImage(e.target.files[0])} // Set the image state when a file is selected
              type="file"
              id="avatar"
              accept=".png,.jpg, .jpeg" // Restricting file types to images
              hidden
            />
            {/* Displaying the selected image or default avatar */}
            {image ? (
              <img
                className="w-[50px] aspect-square rounded-full"
                src={URL.createObjectURL(image)} // Show the uploaded image or default avatar
                alt="Profile"
              />
            ) : (
              <PiUserCircleFill className="text-6xl" />
            )}
            Upload profile image
          </label>

          {/* Name input field */}
          <input
            className="p-[10px] min-w-[300px] border border-[#c9c9c9] outline-orange"
            type="text"
            placeholder="Your name"
            required
            onChange={(e) => setName(e.target.value)} // Update name state when input changes
            value={name}
          />

          {/* Bio textarea field */}
          <textarea
            className="p-[10px] min-w-[300px] border border-[#c9c9c9] outline-orange"
            placeholder="Write profile bio"
            required
            onChange={(e) => setBio(e.target.value)} // Update bio state when input changes
            value={bio}
          ></textarea>

          {/* Save button */}
          <button
            className="text-white bg-orange p-2 cursor-pointer text-base"
            type="submit" // Submit the form to update the profile
          >
            Save
          </button>
        </form>

        {/* Display the current or new profile image */}
        <img
          className="max-w-[160px] aspect-square my-5 mx-auto rounded-full"
          src={
            image
              ? URL.createObjectURL(image) // If a new image is uploaded, show it
              : prevImage // If no new image is uploaded, show the previously saved image
              ? prevImage
              : logo // If no image is uploaded, show the default logo
          }
          alt=""
        />
      </div>
    </div>
  );
}
