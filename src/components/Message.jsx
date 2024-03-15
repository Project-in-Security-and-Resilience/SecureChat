import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

// Function to fetch the current user's private key from local storage
export function fetchPrivateKey(useruid) {
  if (!useruid) {
      throw new Error("No user is currently logged in.");
  }
  const privateKey = localStorage.getItem(`${useruid}_privateKey`);
  if (!privateKey) {
      throw new Error("Private key not found for the current user.");
  }
  
  return privateKey;
}

async function decryptWithPrivateKey(privateKeyString, encryptedMessageBase64) {
  try {
      // Decode the Base64-encoded encrypted message
      const encryptedMessageBuffer = Uint8Array.from(atob(encryptedMessageBase64), c => c.charCodeAt(0));

      // Decode the Base64-encoded private key string
      const privateKeyBuffer = Uint8Array.from(atob(privateKeyString), c => c.charCodeAt(0));
      console.log(" decrypting key buff:",privateKeyBuffer)
      // Import the private key
      const privateKey = await window.crypto.subtle.importKey(
          "pkcs8",
          privateKeyBuffer,
          {
              name: "RSA-OAEP",
              hash: "SHA-256"
          },
          true,
          ["decrypt"]
      );
      console.log(" decrypting key :",privateKey)
      // Decrypt the encrypted message using the private key
      const decryptedMessageBuffer = await window.crypto.subtle.decrypt(
          {
              name: "RSA-OAEP"
          },
          privateKey,
          encryptedMessageBuffer
      );
      console.log(" decrypting message buff:",decryptedMessageBuffer)
      // Convert the decrypted message buffer to a string
      const decryptedMessage = new TextDecoder().decode(decryptedMessageBuffer);
      console.log(" decrypting message:",decryptedMessage)
      return decryptedMessage;
  } catch (error) {
      console.error("Error decrypting message:", error);
      throw error;
  }
}

const Message = ({ message }) => {
  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);
  const [decryptedMes, setDecryptedMes] = useState("");

  const ref = useRef();
  const privateKey = fetchPrivateKey(currentUser.uid);

  useEffect(() => {
    const decryptMessage = async () => {
      try {
        const decryptedMessage = await decryptWithPrivateKey(
          privateKey,
          message.encryptedText.recipient
        );
        setDecryptedMes(decryptedMessage);
      } catch (error) {
        try{
          try {
          const decryptedMessage = await decryptWithPrivateKey(
            privateKey,
            message.encryptedText.sender
          );
          setDecryptedMes(decryptedMessage);
        }catch(error){
          console.error("Error decrypting message:", error);
        }
      }catch(error){
        console.error("Error decrypting message:", error);
        }
        console.error("Error decrypting message:", error);
      }
    };

    decryptMessage();
  }, [message, privateKey]);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [decryptedMes]);

  // Function to format timestamp to display in a human-readable format
  const formatTimestamp = (timestamp) => {
    if (!timestamp || !timestamp.seconds) {
      return ''; // Return an empty string or handle appropriately
    }
    const milliseconds = timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000;
    const date = new Date(milliseconds);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      ref={ref}
      className={`message ${message.senderId === currentUser.uid && "owner"}`}
    >
      <div className="messageInfo">
        <img
          src={
            message.senderId === currentUser.uid
              ? currentUser.photoURL
              : data.user.photoURL
          }
          alt=""
        />
        <span>{formatTimestamp(message.date)}</span>
      </div>
      <div className="messageContent">
        <p>{decryptedMes}</p>
        {message.img && <img src={message.img} alt="" />}
      </div>
    </div>
  );
};

export default Message;
