/**
 * * Chat Component:
  * This component is responsible for rendering the chat interface in the application. 
  * It utilizes the context from ChatContext to access and display user and chat data. 
  * Additionally, it integrates a feature for steganography, allowing users to encode 
  * and decode hidden messages within images directly from the chat interface
 * 
 * * Features:
 * - Displays the current user's display name at the top of the chat.
 * - Includes icons for camera access, adding new items, and more options which can be customized
 *   as per the application's functionality.
 * - A button to toggle the steganography modal for sending or decoding hidden messages in images.
 * - Dynamically loads the SteganographyComponent as a modal when the user opts to send or decode 
 *   a hidden message.
 * - Renders the Messages component to display the conversation and the Input component for message input.
 * 
 * * State:
 * - isStegModalOpen (boolean): Manages the visibility of the steganography modal. It toggles between 
 *   true and false to show or hide the modal.
 * 
 * * Functions:
 * - toggleStegModal(): A function to toggle the state of isStegModalOpen, controlling the visibility 
 * of the SteganographyComponent modal.
 **/


import React, { useContext , useState } from "react";
import Cam from "../img/cam.png";
import Add from "../img/add.png";
import More from "../img/more.png";
import Messages from "./Messages";
import Input from "./Input";
import { ChatContext } from "../context/ChatContext";
import SteganographyComponent from "./SteganographyComponent";


const Chat = () => {
  
  const { data } = useContext(ChatContext); // Use ChatContext to access chat data
  const [isStegModalOpen, setIsStegModalOpen] = useState(false); // State for managing the visibility of the steganography modal


  // Function to toggle the visibility of the steganography modal
  const toggleStegModal = () => {
    setIsStegModalOpen(!isStegModalOpen);
  };

  // Render the chat UI
  return (
    <div className="chat">
      <div className="chatInfo">
        <span>{data.user?.displayName}</span> {/* Display the current user's display name */}
        {/* Display chat-related icons */}
        <div className="chatIcons">
          {/* Button to toggle the steganography modal */}
          <button className="sendDecode" onClick={toggleStegModal}>Text to Image Encode</button>
      {/* Conditionally render the steganography modal based on isStegModalOpen state */}
      {isStegModalOpen && (
        <div className="modalBackdrop" onClick={toggleStegModal}>
          <div className="steganographyModal" onClick={e => e.stopPropagation()}>
            <SteganographyComponent />  {/* Render SteganographyComponent inside the modal */}
            <button className="closeModalButton" onClick={toggleStegModal}>Close</button>
          </div>
        </div>
        
      )}
        </div>
      </div>
      
      
      <Messages /> {/* Render Messages component */}
      <Input/>  {/* Render Input component */}
    </div>
  );
};

export default Chat;
