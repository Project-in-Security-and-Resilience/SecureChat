/**
 ** Message Component:
 *  The Message component is designed for use in a chat application that incorporates
 *  end-to-end encryption. 
 *  It displays individual chat messages, handling both text and image messages. 
 *  The component also supports decrypting 
 *  messages using RSA-OAEP, ensuring that only the intended recipient can read the message content.
 * 
 * * Dependencies:
 * - React and its hooks (useContext, useEffect, useRef, useState) for component state management and lifecycle.
 * - AuthContext and ChatContext for accessing the current user's authentication status and chat-related data.
 * - LocalStorage for retrieving the current user's private key.
 * - The Web Crypto API for cryptographic operations, including message decryption.
 * 
 * * Functions:
 * - fetchPrivateKey(useruid): Retrieves the current user's private key from localStorage.
 *   Throws an error if no user is 
 *   logged in or if the private key is not found.
 * - decryptWithPrivateKey(privateKeyString, encryptedMessageBase64): Decrypts an encrypted
 *   message using the user's private 
 *   key. It handles the decryption process, including converting the Base64-encoded message 
 *   and key to the format expected 
 *   by the Web Crypto API, performing the decryption, and then converting the decrypted 
 *   ArrayBuffer back to a string.
 * 
 * * Features:
 * - Decrypts encrypted messages using the recipient's private key, 
 *   falling back to the sender's private key if necessary. 
 *   This allows users to view both sent and received messages.
 * - Automatically scrolls to the latest message when the component updates.
 * - Formats and displays the message timestamp in a human-readable format.
 * - Displays image messages if available, alongside the decrypted text message.
 * 
 * 
 * */

 import React, { useContext, useEffect, useRef, useState } from "react";
 import { AuthContext } from "../context/AuthContext";
 import { ChatContext } from "../context/ChatContext";
 import {
  doc,
  getDoc,
} from "firebase/firestore";
import GptAccInfo from "../ai_helper/GetGptAccInfo.js";
import { db } from "../firebase";

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
 
 // Function to decrypt an encrypted message using the user's private key
 export async function decryptWithPrivateKey(privateKeyString, encryptedMessageBase64) {
   try {
     // Decode the Base64-encoded encrypted message
     const encryptedMessageBuffer = Uint8Array.from(atob(encryptedMessageBase64), c => c.charCodeAt(0));
     // Decode the Base64-encoded private key string
     const privateKeyBuffer = Uint8Array.from(atob(privateKeyString), c => c.charCodeAt(0));
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
     // Decrypt the encrypted message using the private key
     const decryptedMessageBuffer = await window.crypto.subtle.decrypt(
       {
         name: "RSA-OAEP"
       },
       privateKey,
       encryptedMessageBuffer
     );
     // Convert the decrypted message buffer to a string
     const decryptedMessage = new TextDecoder().decode(decryptedMessageBuffer);
     
     return decryptedMessage;
   } catch (error) {
     throw error;
   }
 }

// Function to fetch the sender's public key from Firebase
async function fetchSenderPublicKey(senderId) {
  try {
    const senderDoc = await getDoc(doc(db, "users", senderId));
    return senderDoc.data()?.publicKey;
  } catch (error) {
    console.error("Error fetching sender's public key:", error);
    throw error;
  }
}

// Function to verify the digital signature using the sender's public key
async function verifySignature(publicKeyString, message, signature) {
  try {
    const encryptedSignBuffer = Uint8Array.from(atob(signature), c => c.charCodeAt(0));

    const publicKeyBuffer = Uint8Array.from(
      atob(publicKeyString),
      c => c.charCodeAt(0)
    );

    const publicKey = await window.crypto.subtle.importKey(
      "spki",
      publicKeyBuffer,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: {
          name: "SHA-256"
        },
        modulusLength: 2048,
        extractable: false,
        publicExponent: new Uint8Array([1, 0, 1])
      },
      true,
      ["verify"]
    );

    const messageBuffer = new TextEncoder().encode(message);
    const result = await window.crypto.subtle.verify(
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: {
          name: "SHA-256"
        },
        modulusLength: 2048,
        extractable: false,
        publicExponent: new Uint8Array([1, 0, 1])
      },
      publicKey,
      encryptedSignBuffer,
      messageBuffer
    );

    return result;
  } catch (error) {
    console.log(error)
    throw error;
  }
}
 
 const Message = ({ message }) => {
   const { currentUser } = useContext(AuthContext); // Current user data from AuthContext
   const { data } = useContext(ChatContext); // Active chat data from ChatContext
   const [decryptedMes, setDecryptedMes] = useState(""); // State to hold the decrypted message
  const [senderPublicKey, setSenderPublicKey] = useState(""); // State to hold the sender's public key

 
   const ref = useRef(); // Ref for the message element for automatic scrolling
   const privateKey = fetchPrivateKey(currentUser.uid);
 
   useEffect(() => {
    const fetchSenderPublicKeyAndDecrypt = async () => {
      try {
        const gptInfo = await GptAccInfo();
        if(message.senderId!=currentUser.uid && message.senderId!=gptInfo.uid){
          const publicKey = await fetchSenderPublicKey(message.senderId);
        setSenderPublicKey(publicKey);
        const isSignatureValid = await verifySignature(
          publicKey,
          message.encryptedText.recipient,
          message.signature
        );
        
        if (isSignatureValid) {
          // Decrypt and display the message
          const decryptedMessage = await decryptWithPrivateKey(
            privateKey,
            message.encryptedText.recipient
          );
          setDecryptedMes(decryptedMessage);
        } else {
          console.error("Invalid digital signature. Message integrity compromised.");
        }
      }else if (message.senderId==currentUser.uid){
        const isSignatureValid=true;
          // Decrypt and display the message
          const decryptedMessage = await decryptWithPrivateKey(
            privateKey,
            message.encryptedText.sender
          );
          setDecryptedMes(decryptedMessage);
        
      }else if (message.senderId==gptInfo.uid){
        const isSignatureValid=true;
          // Decrypt and display the message
          const decryptedMessage = await decryptWithPrivateKey(
            privateKey,
            message.encryptedText.recipient
          );
          setDecryptedMes(decryptedMessage);
        
      }
      } catch (error) {
        console.error("Error fetching sender's public key or decrypting message:", error);
      }
    };

    fetchSenderPublicKeyAndDecrypt();
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
         <span className="timestamp">{formatTimestamp(message.date)}</span>
         
       </div>
       <div className="messageContent">
       {message.disappear && <span className="expiry">Expires in 5 mins</span>}
         <p>{decryptedMes}</p>
         {message.img && <img src={message.img} alt="" />}
       </div>
     </div>
   );
 };
 
 export default Message;
 