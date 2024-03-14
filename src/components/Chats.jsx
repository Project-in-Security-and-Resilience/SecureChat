import { doc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";
import { decryptMessage } from '../encryption';
const Chats = () => {
  const [chats, setChats] = useState([]);

  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);

  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        //setChats(doc.data());
        let chatsData = doc.data();
        const decryptedChats = Object.entries(chatsData).reduce((acc, [chatId, chatInfo]) => {
          if (chatInfo.lastMessage && chatInfo.lastMessage.text) {
              const decryptedText = decryptMessage(chatInfo.lastMessage.text); // Decrypt
              acc[chatId] = { ...chatInfo, lastMessage: { ...chatInfo.lastMessage, text: decryptedText } };
          } else {
              acc[chatId] = chatInfo; // If no lastMessage or text, leave as is
          }
          return acc;
      }, {});
      
      // Converting the decryptedChats back
      setChats(decryptedChats);
      });

      return () => {
        unsub();
      };
    };

    currentUser.uid && getChats();
  }, [currentUser.uid]);

  const handleSelect = (u) => {
    dispatch({ type: "CHANGE_USER", payload: u });
  };

  return (
    <div className="chats">
      {Object.entries(chats)?.sort((a,b)=>b[1].date - a[1].date).map((chat) => (
        <div
          className="userChat"
          key={chat[0]}
          onClick={() => handleSelect(chat[1].userInfo)}
        >
          <img src={chat[1].userInfo.photoURL} alt="" />
          <div className="userChatInfo">
            <span>{chat[1].userInfo.displayName}</span>
            <p>{chat[1].lastMessage?.text || "No message"}</p> {/* Display decrypted last message */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Chats;
