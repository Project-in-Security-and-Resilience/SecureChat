import React, { useContext , useState } from "react";
import Cam from "../img/cam.png";
import Add from "../img/add.png";
import More from "../img/more.png";
import Messages from "./Messages";
import Input from "./Input";
import { ChatContext } from "../context/ChatContext";
import SteganographyComponent from "./SteganographyComponent";


const Chat = () => {
  const { data } = useContext(ChatContext);
  const [isStegModalOpen, setIsStegModalOpen] = useState(false);


  const toggleStegModal = () => {
    setIsStegModalOpen(!isStegModalOpen);
  };


  return (
    <div className="chat">
      <div className="chatInfo">
        <span>{data.user?.displayName}</span>
        <div className="chatIcons">
          <img src={Cam} alt="" />
          <img src={Add} alt="" />
          <img src={More} alt="" />
        </div>
      </div>
      <button className="sendDecode" onClick={toggleStegModal}>Send/Decode hidden message</button>
      {isStegModalOpen && (
        <div className="modalBackdrop" onClick={toggleStegModal}>
          <div className="steganographyModal" onClick={e => e.stopPropagation()}>
            <SteganographyComponent />
            <button className="closeModalButton" onClick={toggleStegModal}>Close</button>
          </div>
        </div>
        
      )}
      
      <Messages />
      <Input/>
    </div>
  );
};

export default Chat;
