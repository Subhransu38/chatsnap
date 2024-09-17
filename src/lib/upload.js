// Importing necessary Firebase Storage functions
import {
  getStorage, // Get the Firebase Storage instance
  ref, // Create a reference to a specific file location in storage
  uploadBytesResumable, // Uploads the file and tracks the progress of the upload
  getDownloadURL, // Retrieves the download URL once the file is uploaded
} from "firebase/storage";

// Function to upload a file to Firebase Storage
const upload = async (file) => {
  // Initialize the Firebase Storage instance
  const storage = getStorage();

  // Create a storage reference for the file to be uploaded
  // The file is stored in the 'images' folder with a unique name (using current timestamp and file name)
  const storageRef = ref(storage, `images/${Date.now() + file.name}`);

  // Upload the file to the storage location, and return an upload task that monitors the upload
  const uploadTask = uploadBytesResumable(storageRef, file);

  // Return a Promise that resolves with the download URL once the upload is complete
  return new Promise((resolve, reject) => {
    // Listen for state changes during the file upload process
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Calculate and log the upload progress as a percentage
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");

        // Check the current state of the upload
        switch (snapshot.state) {
          case "paused": // If the upload is paused, log it
            console.log("Upload is paused");
            break;
          case "running": // If the upload is running, log it
            console.log("Upload is running");
            break;
        }
      },
      (error) => {
        // If an error occurs during the upload, reject the Promise with the error
        console.error("Upload failed:", error);
        reject(error);
      },
      () => {
        // When the upload is complete, get the download URL of the uploaded file
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL); // Resolve the Promise with the download URL
        });
      }
    );
  });
};

// Export the upload function to be used elsewhere in the app
export default upload;
