/**
 ** Chats Component:
 * This component is responsible for rendering the chat list in the application, including
 *  a special entry for interacting with an AI (GPT) assistant. It uses Firebase Firestore 
 * to fetch and display user chat data, and allows users to initiate a conversation with 
 * selected chat partners or the AI assistant.
 * 
 * * Features:
 * - Dynamically lists all chats for the current user, sorted by the most recent message.
 * - Provides an entry point for interacting with an AI assistant, allowing users to ask
 *   questions and receive responses.
 * - Integrates with Firebase Firestore for real-time chat data fetching and updates.
 * - Uses the AuthContext for accessing the current user's information and the ChatContext
 *  for managing chat state across the application.
 * 
 * * Integration with Firebase Firestore:
 * - Utilizes the `onSnapshot` method to listen for real-time updates to the user's chats.
 * - Employs `getDoc`, `setDoc`, and `updateDoc` methods for fetching, creating, and updating
 *  chat data in Firestore.
 * 
 * * Functions:
 * -  handleSelect(u)`: Triggers upon selecting a chat from the list, updating the global chat 
 *    context to reflect the selected user.
 * -  handleSelectAI()`: Initiates a chat session with the AI assistant by updating the global 
 *    chat context and handling necessary Firestore document updates for the chat.
 * -  handleSelectGPT(user)`: Checks for an existing chat with the AI assistant in Firestore and
 *     creates it if not found. Also updates user chat documents to include the AI assistant chat.
 * 
 * * Usage:
 * - Render the `Chats` component within a user interface where a list of chat conversations is required.
 * - Ensure that `AuthContext` and `ChatContext` providers wrap the component or its parent component to
 *   provide necessary context data.
 * - The Firebase Firestore instance (`db`) should be correctly initialized and provided in the application.
 * */

import {doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc} from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";
import GptAccInfo from "../ai_helper/GetGptAccInfo.js";
import {gptAccountInfos} from "../ai_helper/UNIQUE_GPT_ACCOUNT.js";


const Chats = () => {
  const [chats, setChats] = useState([]); // State to store chat list

  // Context hooks for user and chat data
  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);

  // Effect hook to fetch chats from Firestore on component mount or currentUser.uid change
  useEffect(() => {
    const getChats = () => {
      // Listen for real-time updates to user's chat list
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        setChats(doc.data());
      });

      // Cleanup function to unsubscribe from the listener
      return () => {
        unsub();
      };
    };

    // Fetch chats if a user is logged in
    currentUser.uid && getChats();
  }, [currentUser.uid]);

  // Handler for selecting a chat
  const handleSelect = async (u) => {
    dispatch({ type: "CHANGE_USER", payload: u });
  };

   // Handler for selecting the AI assistant
  const handleSelectAI = async () => {
    console.log("Select AI")
    const data = await GptAccInfo(); // Fetch AI account info
    console.log(data.uid);
    console.log(currentUser.uid);
    dispatch({ type: "CHANGE_USER", payload: data });
    //hidden the top of ai assistant
    document.getElementById('gptDiv').style.display = 'none'; // Hide the AI assistant entry in UI
    await handleSelectGPT(data);
  };

  // Function to setup chat with the AI or a user
  const handleSelectGPT = async (user) => {
    //check whether the group(chats in firestore) exists, if not create
    const combinedId =
        currentUser.uid > user.uid
            ? currentUser.uid + user.uid
            : user.uid + currentUser.uid;
    const gptCombinedId =
        currentUser.uid > user.uid
            ? user.uid + currentUser.uid
            : currentUser.uid + user.uid ;
    try {
      const res = await getDoc(doc(db, "chats", combinedId));
      // const res2 = await getDoc(doc(db, "chats", gptCombinedId));
      // if (!res2.exists()){

      //   await setDoc(doc(db, "chats", gptCombinedId), { messages: [] });
      // }

      if (!res.exists()) {
        //create a chat in chats collection
        await setDoc(doc(db, "chats", combinedId), { messages: [] });

        // Update userChats for both users involved in the chat
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
  };

  return (
    <div className="chats">
      <div id="gptDiv" className="userChat" onClick={() => handleSelectAI()}>
        <img src= {gptAccountInfos.photoURL} alt=""/>
        <div className="userChatInfo">
          <span>{gptAccountInfos.displayName}</span>
          <p>ask any Questions...</p>
        </div>
      </div>
      {Object.entries(chats)?.sort((a, b) => b[1].date - a[1].date).map((chat) => (
          <div
              className="userChat"
              key={chat[0]}
              onClick={() => handleSelect(chat[1].userInfo)}
          >
          <img src={chat[1].userInfo.photoURL} alt="" />
          <div className="userChatInfo">
            <span>{chat[1].userInfo.displayName}</span>
            <p>{chat[1].lastMessage?.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Chats;
