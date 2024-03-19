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
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { v4 as uuid } from "uuid";
import GptAccInfo from "../ai_helper/GetGptAccInfo.js";
import { getAIResp } from "../ai_helper/gptCaller.js";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import DOMPurify from "dompurify";
import { fetchPrivateKey } from "./Message";
import { decryptWithPrivateKey } from "./Message";

async function encryptWithPublicKey(publicKeyString, message) {
  try {
    const publicKeyBuffer = Uint8Array.from(
      atob(publicKeyString),
      (c) => c.charCodeAt(0)
    );

    const publicKey = await window.crypto.subtle.importKey(
      "spki",
      publicKeyBuffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["encrypt"]
    );

    const messageBuffer = new TextEncoder().encode(message);

    const encryptedMessageBuffer = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKey,
      messageBuffer
    );

    const encryptedMessageBase64 = btoa(
      String.fromCharCode(...new Uint8Array(encryptedMessageBuffer))
    );

    return encryptedMessageBase64;
  } catch (error) {
    throw error;
  }
}

const Input = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [timeSend, setTimeSend] = useState(false); // Toggle state for time-send
  const [buttonColor, setButtonColor] = useState("#cccccc");

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const handleSend = async () => {
    // Set disappear to true for time-send messages
    const disappear = timeSend ? true : false;

    if (text.includes("<script>")) {
      alert("Your message has been blocked to protect from XSS attacks.");
      return;
    }

    const sanitizedText = DOMPurify.sanitize(text);

    if (!sanitizedText.trim() && !img) {
      alert("Please enter a message.");
      return;
    }
    let encryptedText = null;

    if (data.user?.uid && sanitizedText) {
      const recipientDoc = await getDoc(doc(db, "users", data.user.uid));
      const recipientPublicKey = recipientDoc.data()?.publicKey;

      encryptedText = await encryptWithPublicKey(
        recipientPublicKey,
        sanitizedText
      );

      const senderDoc = await getDoc(doc(db, "users", currentUser.uid));
      const senderPublicKey = senderDoc.data()?.publicKey;

      const encryptedForSender = await encryptWithPublicKey(
        senderPublicKey,
        sanitizedText
      );

      encryptedText = { recipient: encryptedText, sender: encryptedForSender };
    }

    if (img) {
      const storageRef = ref(storage, uuid());

      const uploadTask = uploadBytesResumable(storageRef, img);

      try {
        const snapshot = await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {},
            (error) => reject(error),
            () => resolve(uploadTask.snapshot)
          );
        });

        const downloadURL = await getDownloadURL(snapshot.ref);

        await updateDoc(doc(db, "chats", data.chatId), {
          messages: arrayUnion({
            id: uuid(),
            encryptedText,
            disappear,
            senderId: currentUser.uid,
            date: Timestamp.now(),
            img: downloadURL,
          }),
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        // Handle error
      }
    } else {
      await updateDoc(doc(db, "chats", data.chatId), {
        messages: arrayUnion({
          id: uuid(),
          encryptedText,
          disappear,
          senderId: currentUser.uid,
          date: Timestamp.now(),
        }),
      });

      const gptInfo = await GptAccInfo();

      if (data.user.uid === gptInfo.uid && img === null) {
        const privateKey = fetchPrivateKey(currentUser.uid);
        const decryptedMessage = await decryptWithPrivateKey(
          privateKey,
          encryptedText.sender
        );
        const combinedId =
          currentUser.uid > gptInfo.uid
            ? gptInfo.uid + currentUser.uid
            : currentUser.uid + gptInfo.uid;
        const reply = await getAIResp(decryptedMessage);

        const gptDoc = await getDoc(doc(db, "users", gptInfo.uid));
        const gptPublicKey = gptDoc.data()?.publicKey;
        const encryptedForSender = await encryptWithPublicKey(
          gptPublicKey,
          reply
        );
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        const userPublicKey = userDoc.data()?.publicKey;
        const encryptedForReceiver = await encryptWithPublicKey(
          userPublicKey,
          reply
        );
        const gptEncryptedText = {
          recipient: encryptedForReceiver,
          sender: encryptedForSender,
        };
        await updateDoc(doc(db, "chats", data.chatId), {
          messages: arrayUnion({
            id: uuid(),
            encryptedText: gptEncryptedText,
            disappear,
            senderId: gptInfo.uid,
            date: Timestamp.now(),
          }),
        });
      }
    }
    if (pdf) {
      const storageRef = ref(storage, uuid());
      const uploadTask = uploadBytesResumable(storageRef, pdf);

      try {
        const snapshot = await new Promise((resolve, reject) => {
          uploadTask.on(
              "state_changed",
              (snapshot) => {},
              (error) => reject(error),
              () => resolve(uploadTask.snapshot)
          );
        });

        const downloadURL = await getDownloadURL(snapshot.ref);

        // 更新 Firestore 文档以包含上传的 PDF 文件信息
        await updateDoc(doc(db, "chats", data.chatId), {
          messages: arrayUnion({
            id: uuid(),
            encryptedText,
            disappear,
            senderId: currentUser.uid,
            date: Timestamp.now(),
            pdf: downloadURL, // 添加 PDF 文件的下载链接
          }),
        });
      } catch (error) {
        console.error("Error uploading PDF:", error);
      }
    }

    if (!disappear) {
    await updateDoc(doc(db, "userChats", currentUser.uid), {
      [data.chatId + ".lastMessage"]: {
        encryptedText,
        disappear,
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    await updateDoc(doc(db, "userChats", data.user.uid), {
      [data.chatId + ".lastMessage"]: {
        encryptedText,
        disappear,
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });
  }
    // Reset text and img state
    setText("");
    setImg(null);
    setPdf(null);
  };

  const toggleTimeSend = () => {
    setTimeSend(prevTimeSend => !prevTimeSend);
    if (!timeSend) {
      setButtonColor("#FF0000"); // Gray color when timeSend is enabled
    } else {
      setButtonColor("#488C7A"); // Green color when timeSend is disabled
    }
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
        <input
            type="file"
            style={{display: "none"}}
            id="file"
            onChange={(e) => setImg(e.target.files[0])}
        />
        <label htmlFor="file">
          <img src={Img} alt=""/>
        </label>
        <input
            type="file"
            style={{display: "none"}}
            id="file"
            accept=".pdf" // PDF file limitation
            onChange={(e) => setPdf(e.target.files[0])} // update PDF file state
        />
        <label htmlFor="file">
          <img src={Attach} alt=""/> {/* Use a new icon to indicate uploading a PDF */}
        </label>

        <button onClick={toggleTimeSend} style={{backgroundColor: buttonColor}}>
          {timeSend ? 'Disable Expiry' : 'Enable Expiry'}
        </button>
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Input;
