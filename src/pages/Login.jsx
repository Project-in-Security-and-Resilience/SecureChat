/**
 ** Login Component:
 *  The Login component provides a user interface for signing into the application using email
 *  and password authentication managed by Firebase Auth. It supports additional login methods 
 * including social login options (Google, Facebook) and a mechanism for users to provide a private
 *  key when logging in from a new device.
 * 
 ** Structure:
 * - The component renders a form for email and password input, buttons for social login options, 
 *  and optionally, an input for the user's private key if it is not found in the local storage.
 * - Error messages are displayed if authentication fails or if there is an issue with the private 
 *  key login process.
 * 
 ** Features:
 * - Email and password authentication with Firebase Auth.
 * - Display and handling of authentication errors.
 * - Private key input for users logging in from a new device, 
 * enhancing security by requiring decryption keys to be manually entered.
 * - Social login options with placeholder buttons for Google and Facebook authentication.
 * - Navigation to the home page upon successful login or to the registration page for new users.
 * 
 **  Dependencies:
 * - React and useState hook for component state management.
 * - useNavigate hook from React Router Dom for programmatic navigation.
 * - signInWithEmailAndPassword function from Firebase Auth for email/password authentication.
 * - auth object from Firebase configuration for current user state and authentication.
 * 
 **  State:
 * - err: Boolean state to indicate whether an authentication error occurred.
 * - privateKey: State for storing the user's private key input.
 * - showPrivateKeyInput: Boolean state to control the display of the private key input field.
 * 
 **  Event Handlers:
 * - handleSubmit: Handles the form submission for email/password authentication.
 * - handlePrivateKeyInputChange: Manages state updates for the private key input.
 * - handleLoginWithPrivateKey: Triggers login logic that involves the user's private key.
 * 
 */


// import necessary components
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword , sendPasswordResetEmail } from "firebase/auth";
import googleIcon from '../img/google.png'; // 导入 Google 图标
import facebookIcon from '../img/facebook.png'; // 导入 Facebook 图标
import { auth,db } from "../firebase";
import SVGComponent from '../components/SVGComponent';
import {
  doc,
  getDoc,
} from "firebase/firestore";
import { encryptWithPublicKey } from "../components/Input";
import { decryptWithPrivateKey } from "../components/Message";

const Login = () => {
  const [err, setErr] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  const [showPrivateKeyInput, setShowPrivateKeyInput] = useState(false);
  const navigate = useNavigate();
  

  // Function to verify if the public and private keys work together correctly
const verifyKeys = async (publicKey, privateKey, testMessage) => {
  try {
    // Encrypt the test message using the user's public key
    const encryptedMessage = await encryptWithPublicKey(publicKey, testMessage);
    // Decrypt the encrypted message using the user's private key
    const decryptedMessage = await decryptWithPrivateKey(privateKey, encryptedMessage);
    // Compare decrypted message with original message
    return decryptedMessage === testMessage;
    
  } catch (error) {
    return false;
  }
};

  // Function to handle form submission for email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      await signInWithEmailAndPassword(auth, email, password);


      // Retrieve user's public key from the database
      const userDoc = await getDoc(doc(db, "users", auth.currentUser?.uid));
      const publicKey = userDoc.data()?.publicKey;

      // Encrypt the test message using the user's public key
    const testMessage = "Your original test message"; // Provide your original test message here


      // Check if private key exists for the user
      const storedPrivateKey = localStorage.getItem(`${auth.currentUser?.uid}_privateKey`);
      if (!storedPrivateKey) {
        setShowPrivateKeyInput(true);
      } else {
        if(await verifyKeys(publicKey,storedPrivateKey,testMessage)){
          navigate("/");
        }else{
          setShowPrivateKeyInput(true);
          setErr(true);
        }
      }
    } catch (err) {
      setShowPrivateKeyInput(true);
      setErr(true);
    }
  };

   // Updates state based on changes to the private key input field
  const handlePrivateKeyInputChange = (e) => {
    setPrivateKey(e.target.value);
  };

  // Function for handling login when a private key is required
  const handleLoginWithPrivateKey = async () => {
    try {
      // Retrieve user's public key from the database
      const userDoc = await getDoc(doc(db, "users", auth.currentUser?.uid));
      const publicKey = userDoc.data()?.publicKey;
      const testMessage = "Your original test message"; // Provide your original test message here

      // Store the private key locally
      localStorage.setItem(`${auth.currentUser?.uid}_privateKey`, privateKey);
      if(await verifyKeys(publicKey,privateKey,testMessage)){
      // Example: Navigate to the next page after successful login
      navigate("/");
      }else{
          setShowPrivateKeyInput(true);
          setErr(true);
      }
    } catch (error) {
          setShowPrivateKeyInput(true);
          setErr(true);
    }
  };

  // Function for Reset Password
  const handlePasswordReset = async () => {
    const email = prompt("Please enter your email address:");
    if (email) {
      try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset email sent. Please check your inbox.");
      } catch (error) {
        alert("Failed to send password reset email. Please try again.");
      }
    }
  };



  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo"><SVGComponent color="green"/></span>
        <span className="title">Login</span>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input type="email" name="email" placeholder="Email" required/>
          </div>
          <div className="input-group">
            <input type="password" name="password" placeholder="Password" required/>
          </div>
          <button type="submit">Sign In</button>
          {/*<button type="button" onClick={handlePasswordReset}>Forgot Password?</button>*/}
          {err && <span>Something went wrong</span>}
        </form>
        {showPrivateKeyInput && (
            <div className="formWrapper">
            <p>Private Key was reset. Please enter your new private key from your old device:</p>
            <input type="text" value={privateKey} onChange={handlePrivateKeyInputChange} />
            <button className="privateKeyInput" onClick={handleLoginWithPrivateKey}>Login with Private Key</button>
          </div>
        )}
{/* Link to the registration page for new users */}
        <div className="register">
          <a href="#" onClick={handlePasswordReset} style={{color: 'green', cursor: 'pointer' , fontSize: '14px'}}>Forgot Password?</a>
          <p>Not a member? <Link style={{color: "green"}} to="/register">Register now</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
