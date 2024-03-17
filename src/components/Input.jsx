/**
 * *Input Component:
 * This component is designed to handle user inputs for sending messages within a chat application.
 * It supports text messages and image uploads. The component also integrates with Firebase Firestore
 * for message storage and Firebase Storage for image uploads. Additionally, it includes message encryption
 * functionality to ensure privacy, confidenciality, and security of the communication.
 * 
 * * Features:
 * - Text input for composing messages.
 * - Button to attach and send images.
 * - Integration with Firebase Firestore to store messages and chat details.
 * - Integration with Firebase Storage for storing and retrieving image messages.
 * - RSA encryption of messages using public keys of the sender and recipient for secure communication.
 * - Automatic replies from an AI (GPT) assistant when messaging the AI account.
 * 
 * * Encryption:
 * Messages are encrypted using RSA-OAEP with SHA-256 hashing. Each message is encrypted twice:
 * once with the recipient's public key (for their eyes only) and once with the sender's public key
 * (so they can see what they sent) before being stored in Firestore.
 * 
 * * Sanitization:
 * Uses DOMPurify to sanitize the input text to protect against XSS attacks.
 * 
 * * State:
 * - text (string): The current text input by the user.
 * - img (File | null): The current image selected for upload.
 * 
 * * Functions:
 * - handleSend: Sanitizes the input text, encrypts the message, handles image uploads, 
 *   and updates Firestore documents with the new message.
 * - encryptWithPublicKey: Encrypts text messages with a given public key.
 * 
 * */

import React, { useContext, useState } from "react";
import Img from "../img/img.png";
import Attach from "../img/attach.png";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import {
  arrayUnion,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,getDoc,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { v4 as uuid } from "uuid";
import GptAccInfo from "../ai_helper/GetGptAccInfo.js";
import {getAIResp} from "../ai_helper/gptCaller.js";
import { getDownloadURL, ref, uploadBytesResumable, } from "firebase/storage";
import DOMPurify from "dompurify";
import {fetchPrivateKey} from "./Message";
import { decryptWithPrivateKey } from "./Message";

// Encryption function to securely encrypt messages with a recipient's public key
async function encryptWithPublicKey(publicKeyString, message) {
  try {
      // Decode the Base64-encoded public key string
      const publicKeyBuffer = Uint8Array.from(atob(publicKeyString), c => c.charCodeAt(0));

      // Import the public key
      const publicKey = await window.crypto.subtle.importKey(
          "spki",
          publicKeyBuffer,
          {
              name: "RSA-OAEP",
              hash: "SHA-256"
          },
          true,
          ["encrypt"]
      );

      // Convert the message to ArrayBuffer
      const messageBuffer = new TextEncoder().encode(message);

      // Encrypt the message using the public key
      const encryptedMessageBuffer = await window.crypto.subtle.encrypt(
          {
              name: "RSA-OAEP"
          },
          publicKey,
          messageBuffer
      );

      // Convert the encrypted message to base64
      const encryptedMessageBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedMessageBuffer)));

      return encryptedMessageBase64;
  } catch (error) {
      console.error("Error encrypting message:", error);
      throw error;
  }
}

const Input = () => {
  const [text, setText] = useState(""); // State for managing the text input by the user
  const [img, setImg] = useState(null); // State for managing the image selected by the user

  const { currentUser } = useContext(AuthContext); // Use AuthContext to access the current user's information
  const { data } = useContext(ChatContext); // Use ChatContext to access chat-related data
  const handleSend = async () => {
    // Check if the message text contains <script> tags
    if (text.includes("<script>")) {
      alert("Your message has been blocked to protect from XSS attacks."); // Show a popup
      return; // Exit the function to prevent sending the message
    }

    // Sanitize message text
    const sanitizedText = DOMPurify.sanitize(text);

    // Check if the sanitized message text is empty
    if (!sanitizedText.trim() && !img) {
      alert("Please enter a message."); // Show a popup
      return; // Exit the function if both sanitizedText and img are empty
    }
    let encryptedText = null;

     // Check if there is a recipient user and fetch their public key from Firestore
     if (data.user?.uid) {

      // Fetch recipient's public key from Firestore
      const recipientDoc = await getDoc(doc(db, "users", data.user.uid)); // Use getDoc here
      const recipientPublicKey = recipientDoc.data()?.publicKey;
      console.log(recipientPublicKey)

      // Encrypt the message using the recipient's public key
      encryptedText = await encryptWithPublicKey(recipientPublicKey,sanitizedText);
      console.log("enc text",encryptedText)

      // Fetch recipient's public key from Firestore
      const senderDoc = await getDoc(doc(db, "users", currentUser.uid)); // Use getDoc here
      const senderPublicKey = senderDoc.data()?.publicKey;

      // Encrypt the message using the sender's private key
      const encryptedForSender = await encryptWithPublicKey(senderPublicKey, sanitizedText);

      // Store both encrypted versions of the message in the database
      encryptedText = { recipient: encryptedText, sender: encryptedForSender };
      console.log("???",encryptedText)
    }

    // Handle image uploads separately
    if (img) {
      const storageRef = ref(storage, uuid());

      const uploadTask = uploadBytesResumable(storageRef, img);

      
      uploadTask.on(
        (error) => {
          //TODO:Handle Error
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            await updateDoc(doc(db, "chats", data.chatId), {
              messages: arrayUnion({
                id: uuid(),
                encryptedText,
                senderId: currentUser.uid,
                date: Timestamp.now(),
                img: downloadURL,
              }),
            });
          });
        }
      );
    } else {
        await updateDoc(doc(db, "chats", data.chatId), {
            messages: arrayUnion({
                id: uuid(),
                encryptedText,
                senderId: currentUser.uid,
                date: Timestamp.now(),
            }),
        });

      const gptInfo = await GptAccInfo();
      // If receiver is the gpt account, call gpt api automatically and not support to operate pic
      if (data.user.uid === gptInfo.uid && img===null){
          const privateKey = fetchPrivateKey(currentUser.uid);
          const decryptedMessage = await decryptWithPrivateKey(
              privateKey,
              encryptedText.sender
          );
          console.log("dataChatId",data.chatId)
          const combinedId =
              currentUser.uid > gptInfo.uid
                  ? gptInfo.uid + currentUser.uid
                  : currentUser.uid + gptInfo.uid ;
          console.log("combinedId",combinedId)
          console.log("decrypt",decryptedMessage);
          const reply = await getAIResp(decryptedMessage);
          console.log("reply",reply)

          // Fetch recipient's public key from Firestore
          const gptDoc = await getDoc(doc(db, "users", gptInfo.uid));
          const gptPublicKey = gptDoc.data()?.publicKey;
          const encryptedForSender = await encryptWithPublicKey(gptPublicKey, reply)
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          const userPublicKey = userDoc.data()?.publicKey;
          const encryptedForReceiver = await encryptWithPublicKey(userPublicKey,reply)
          const gptEncryptedText = { recipient: encryptedForReceiver, sender: encryptedForSender };
          console.log("gptId",gptInfo.uid)
          await updateDoc(doc(db, "chats", data.chatId), {
              messages: arrayUnion({
                  id: uuid(),
                  encryptedText: gptEncryptedText,
                  senderId: gptInfo.uid,
                  date: Timestamp.now(),
              }),
          });
      }
    }

    await updateDoc(doc(db, "userChats", currentUser.uid), {
      [data.chatId + ".lastMessage"]: {
        encryptedText,
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    await updateDoc(doc(db, "userChats", data.user.uid), {
      [data.chatId + ".lastMessage"]: {
        encryptedText,
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    // Reset text and img state
    setText("");
    setImg(null);
  };
  return (
    <div className="input">
      <input
        type="text"
        placeholder="Type something..."
        onChange={(e) => setText(e.target.value)}
        value={text}
      />
      <div className="send">
        <img src={Attach} alt="" />
        <input
          type="file"
          style={{ display: "none" }}
          id="file"
          onChange={(e) => setImg(e.target.files[0])}
        />
        <label htmlFor="file">
          <img src={Img} alt="" />
        </label>
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Input;
