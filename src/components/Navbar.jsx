// import React, { useContext } from 'react'
// import {signOut} from "firebase/auth"
// import { auth } from '../firebase'
// import { AuthContext } from '../context/AuthContext'
// import DisplayKey from "./DisplayKey"

// const Navbar = () => {
//   const {currentUser} = useContext(AuthContext)

//   const refresh = async ()=>{
//       location.reload();
//   }
  

//   return (
//     <div className='navbar'>
//       <span className="logo">SecureXChat</span>
//       <div className="user">
//         <img src={currentUser.photoURL} alt="" />
//         <span>{currentUser.displayName}</span>
//         <button onClick={()=>signOut(auth)} onMouseUp={refresh}>logout</button>
//         <DisplayKey />
//       </div>
//     </div>
//   )
// }

// export default Navbar


import React, { useState, useContext } from 'react';
import { signOut } from "firebase/auth";
import { auth } from '../firebase';
import { AuthContext } from '../context/AuthContext';
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
      <span className="logo">SecureXChat</span>
      <div className="user">
        <img src={currentUser.photoURL} alt="" onClick={toggleUserInfo} />
        <span>{currentUser.displayName}</span>
        <button onClick={() => signOut(auth)} onMouseUp={refresh}>logout</button>
        <DisplayKey />
        {showUserInfo && (
          <div className="userInfoModal">
            {/* 这里可以展示用户的个人信息 */}
            <p>Name: {currentUser.displayName}</p>
            <p>Email: {currentUser.email}</p>
            {/* 添加更多的个人信息展示 */}
            <button onClick={toggleUserInfo}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;


