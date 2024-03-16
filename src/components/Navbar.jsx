import React, { useContext } from 'react'
import {signOut} from "firebase/auth"
import { auth } from '../firebase'
import { AuthContext } from '../context/AuthContext'
import DisplayKey from "./DisplayKey"

const Navbar = () => {
  const {currentUser} = useContext(AuthContext)

  const refresh = async ()=>{
      location.reload();
  }
  

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