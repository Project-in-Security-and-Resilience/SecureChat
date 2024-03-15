import {doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc} from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";
import GptAccInfo from "../ai_helper/GetGptAccInfo.js";
import {gptAccountInfos} from "../ai_helper/UNIQUE_GPT_ACCOUNT.js";


const Chats = () => {
  const [chats, setChats] = useState([]);

  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);

  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        setChats(doc.data());
      });

      return () => {
        unsub();
      };
    };

    currentUser.uid && getChats();
  }, [currentUser.uid]);

  const handleSelect = async (u) => {
    dispatch({ type: "CHANGE_USER", payload: u });
  };
  const handleSelectAI = async () => {
    console.log("Select AI")
    const data = await GptAccInfo();
    console.log(data.uid);
    console.log(currentUser.uid);
    dispatch({ type: "CHANGE_USER", payload: data });
    //hidden the top of ai assistant
    document.getElementById('gptDiv').style.display = 'none';
    await handleSelectGPT(data);
  };

  const handleSelectGPT = async (user) => {
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
