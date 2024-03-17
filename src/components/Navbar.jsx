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


import React, { useContext } from 'react'
import {signOut} from "firebase/auth"
import { auth } from '../firebase'
import { AuthContext } from '../context/AuthContext'
import DisplayKey from "./DisplayKey"

const Navbar = () => {
  const {currentUser} = useContext(AuthContext) // Using useContext to access the current authenticated user's data

  // Function to refresh the page, used after signing out to reset application state
  const refresh = async ()=>{
      location.reload();
  }
  

  // renders the UI
  return (
    <div className='navbar'>
      <span className="logo">SecureXChat</span>
      <div className="user">
        <img src={currentUser.photoURL} alt="" />
        <span>{currentUser.displayName}</span>
        <button onClick={()=>signOut(auth)} onMouseUp={refresh}>logout</button>
        <DisplayKey />
      </div>
    </div>
  )
}

export default Navbar