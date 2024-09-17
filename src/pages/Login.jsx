// Importing necessary hooks and Firebase functions
import { useState } from "react"; // useState hook for managing form state
import logo from "../assets/chatsnap.png";
import { signup, login, resetPass } from "../config/firebase"; // Importing Firebase functions for signup, login, and password reset

// Login component
export default function Login() {
  // State to toggle between "Sign up" and "Login" views
  const [currState, setCurrState] = useState("Sign up");

  // State variables to store form inputs: username, email, and password
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Function to handle form submission
  const onSubmitHandler = (e) => {
    e.preventDefault(); // Prevent default form submission behavior (page refresh)

    // Check the current form state (either "Sign up" or "Login") and call the respective Firebase function
    if (currState === "Sign up") {
      signup(username, email, password); // Call the signup function if the user is signing up
    } else {
      login(email, password); // Call the login function if the user is logging in
    }
  };

  return (
    // Main container for the login/signup page, with background image, flexbox layout for centering content
    <div className="min-h-screen overflow-hidden bg-aqua bg-no-repeat bg-cover flex flex-col gap-[30px] items-center justify-center md:flex-row md:justify-evenly md:gap-0">
      {/* Logo or image on the left side */}
      <img className="w-[max(20vw,200px)]" src={logo} alt="" />

      {/* Login/Signup Form */}
      <form
        className="bg-white py-5 px-7 flex flex-col gap-4 rounded-lg"
        onSubmit={onSubmitHandler} // Attach the form submit handler
      >
        {/* Title to display either "Sign up" or "Login" */}
        <h2 className="font-medium text-xl">{currState}</h2>

        {/* Input field for username, only shown during sign up */}
        {currState === "Sign up" && (
          <input
            className="input"
            type="text"
            placeholder="username"
            required
            onChange={(e) => setUserName(e.target.value)} // Update username state when input changes
            value={username}
          />
        )}

        {/* Email input field */}
        <input
          className="input"
          type="email"
          placeholder="Email address"
          required
          onChange={(e) => setEmail(e.target.value)} // Update email state when input changes
          value={email}
        />

        {/* Password input field */}
        <input
          className="input"
          type="password"
          placeholder="Password"
          required
          onChange={(e) => setPassword(e.target.value)} // Update password state when input changes
          value={password}
        />

        {/* Submit button: changes label based on whether it's signup or login */}
        <button
          className="p-2 bg-darkteal text-white text-base rounded cursor-pointer"
          type="submit"
        >
          {currState === "Sign up" ? "Create account" : "Login now"}
        </button>

        {/* Checkbox for agreeing to terms of use and privacy policy */}
        <div className="flex gap-1 text-xs text-[#808080]">
          <input type="checkbox" required /> {/* A simple checkbox */}
          <p>Agree to the terms of use & privacy policy.</p>{" "}
          {/* Terms and privacy notice */}
        </div>

        {/* Links to toggle between "Sign up" and "Login" and reset password */}
        <div className="flex flex-col gap-1">
          {/* If the current state is "Sign up", display a link to switch to "Login" */}
          {currState === "Sign up" ? (
            <p className="text-sm text-[#5c5c5c]">
              Already have an account{" "}
              <span
                className="font-medium text-darkteal cursor-pointer"
                onClick={() => setCurrState("Login")} // Switch to login form when clicked
              >
                Login
              </span>
            </p>
          ) : (
            // If the current state is "Login", display a link to switch to "Sign up"
            <p className="text-sm text-[#5c5c5c]">
              Create an account{" "}
              <span
                className="font-medium text-darkteal cursor-pointer"
                onClick={() => setCurrState("Sign up")} // Switch to sign up form when clicked
              >
                click here
              </span>
            </p>
          )}

          {/* Forgot password option, displayed only in the "Login" state */}
          {currState === "Login" ? (
            <p className="text-sm text-[#5c5c5c]">
              Forgot Password?{" "}
              <span
                className="font-medium text-darkteal cursor-pointer"
                onClick={() => resetPass(email)} // Trigger password reset with the entered email
              >
                reset here
              </span>
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
