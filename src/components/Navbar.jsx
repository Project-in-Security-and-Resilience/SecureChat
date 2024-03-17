import React, { useState, useContext } from 'react';
import { signOut } from "firebase/auth";
import { auth } from '../firebase';
import { AuthContext } from '../context/AuthContext';
import SVGComponent from './SVGComponent';
import DisplayKey from "./DisplayKey";

const Navbar = () => {
  const { currentUser } = useContext(AuthContext);
  const [showUserInfo, setShowUserInfo] = useState(false);

  const refresh = async () => {
      location.reload();
  };

  const toggleUserInfo = () => {
    setShowUserInfo(!showUserInfo);
  };

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
