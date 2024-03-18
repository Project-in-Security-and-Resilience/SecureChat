
/**
 ** Navbar Component:
 * The Navbar component is designed to display the top navigation bar of the SecureXChat application. It includes 
 * the application's logo, displays the current user's photo and name, and provides a logout button. Additionally, 
 * the Navbar integrates a DisplayKey component to show the user's encryption keys.
 * 
 * * Features:
 * - Displays the application logo (SecureXChat).
 * - Shows the current authenticated user's photo and display name.
 * - Provides a logout button that signs the user out using Firebase Authentication.
 * - Refreshes the page upon user sign-out to ensure a clean state for the next user session.
 * - Includes the DisplayKey component which might be responsible for showing public/private key information or similar 
 *   security details to the user.
 * 
 * 
 * */


import React, { useState, useContext } from 'react';
import { signOut } from "firebase/auth";
import { auth } from '../firebase';
import { AuthContext } from '../context/AuthContext';
import SVGComponent from './SVGComponent';
import DisplayKey from "./DisplayKey";

const Navbar = () => {
  const { currentUser } = useContext(AuthContext);// Using useContext to access the current authenticated user's data
  const [showUserInfo, setShowUserInfo] = useState(false);
// Function to refresh the page, used after signing out to reset application state
  const refresh = async () => {
      location.reload();
  };

  const toggleUserInfo = () => {
    setShowUserInfo(!showUserInfo);
  };

  // renders the UI
  return (
    <div className='navbar'>
      <span className="logo"><SVGComponent /></span>
      <div className="user">
        <img src={currentUser.photoURL} alt="" onClick={toggleUserInfo} />
        {showUserInfo && (
          <div className="userInfoModal">
            <div className="userInfoContent">
            <img src={currentUser.photoURL} alt="" style={{width:"200px",height:"200px"}} />
              <p>Name: {currentUser.displayName}</p>
              <p>Email: {currentUser.email}</p>
              
              <DisplayKey />
            </div>
            <div className="userInfoActions">
              <button onClick={() => signOut(auth)}>Logout</button>
              <button onClick={toggleUserInfo}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
