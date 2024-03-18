/**
 ** Search Componenent:
 * The Search component enables users to search for other users by their display names within the
 * SecureXChat application.
 * Upon finding a user, it allows the current user to initiate a new chat with the selected user. 
 * This component interacts with Firebase Firestore to query the user database and to create 
 * or update chat documents as necessary.
 * 
 * * State:
 * - username (string): Holds the search query input by the user.
 * - user (object | null): Stores the found user's data or null if no user is found or before a search is made.
 * - err (boolean): Indicates whether an error occurred during the search operation (e.g., user not found).
 * 
 * * Functions:
 * - handleSearch: Executes the search query against the Firestore database, looking for a user whose displayName matches
 *   the search query. Sets the found user in the state or triggers an error state if the user is not found.
 * - handleKey: Listens for the "Enter" key event on the search input field to trigger the search operation.
 * - handleSelect: Handles the selection of a found user, checking for an existing chat document between the current user
 *   and the selected user. If no chat exists, it creates a new chat document and updates both users' chat lists in Firestore.
 * 
 * 
 * */


import React, { useContext, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../context/AuthContext";
const Search = () => {
  const [username, setUsername] = useState(""); // State to track the search input
  const [user, setUser] = useState(null); // State to hold the found user's data
  const [err, setErr] = useState(false); // State to track any error during search or processing


  const { currentUser } = useContext(AuthContext); // Using AuthContext to access current user's data

  const handleSearch = async () => {

    // Firestore query to find user by displayName
    const q = query(
      collection(db, "users"),
      where("displayName", "==", username)
    );

    try {
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        setUser(doc.data());
      });
    } catch (err) {
      setErr(true);
    }
  };

  const handleKey = (e) => {
    e.code === "Enter" && handleSearch();
  };

  const handleSelect = async () => {
    //check whether the group(chats in firestore) exists, if not create
    const combinedId =
      currentUser.uid > user.uid
        ? currentUser.uid + user.uid
        : user.uid + currentUser.uid;
    try {
      const res = await getDoc(doc(db, "chats", combinedId));

      if (!res.exists()) {
        //create a chat in chats collection
        await setDoc(doc(db, "chats", combinedId), { messages: [] });

        //create user chats
        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [combinedId + ".userInfo"]: {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", user.uid), {
          [combinedId + ".userInfo"]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });
      }
    } catch (err) {}

    setUser(null);
    setUsername("")
  };
  return (
    <div className="search">
      <div className="searchForm">
        <input
          type="text"
          placeholder="Find a user"
          onKeyDown={handleKey}
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        />
      </div>
      {err && <span>User not found!</span>}
      {user && (
        <div className="userChat" onClick={handleSelect}>
          <img src={user.photoURL} alt="" />
          <div className="userChatInfo">
            <span>{user.displayName}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
