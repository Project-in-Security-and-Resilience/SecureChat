/**
 * *Messages Component:
 * The Messages component is responsible for fetching and displaying all messages from a specific chat room. 
 * It listens for real-time updates to the chat's document in Firestore to ensure that the chat interface reflects 
 * the latest messages. This component relies on the Firebase Firestore for data fetching and the ChatContext for 
 * accessing the current chat details.
 * 
 * * State:
 * - messages (Array): A stateful array containing the message objects fetched from the Firestore document corresponding 
 *   to the current chat.
 * 
 * 
 * */

import { doc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";
import Message from "./Message";

const Messages = () => {
  const [messages, setMessages] = useState([]); // State to hold the array of messages for the current chat
  const { data } = useContext(ChatContext); // Using ChatContext to access current chat data, including chatId

  useEffect(() => {
    // Setting up a real-time listener to Firestore document for the current chat
    const unSub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
      // Checking if the document exists and updating the state with its messages
      doc.exists() && setMessages(doc.data().messages);
    });

    // Unsubscribe from the onSnapshot listener when the component unmounts or chatId changes
    return () => {
      unSub();
    };
  }, [data.chatId]);

  console.log(messages)

  return (
    <div className="messages">
       {/* Mapping through the messages state to render a Message component for each message */}
      {messages.map((m) => (
        <Message message={m} key={m.id} />
      ))}
    </div>
  );
};

export default Messages;
