import React, { useContext } from "react";
import Cam from "../img/cam.png";
import Add from "../img/add.png";
import More from "../img/more.png";
import Messages from "./Messages";
import Input from "./Input";
import { ChatContext } from "../context/ChatContext";
import { useNavigate, Link} from 'react-router-dom';
import SteganographyComponent from "./SteganographyComponent";


const Chat = () => {
  const { data } = useContext(ChatContext);
  const navigate = useNavigate();

    // Function to handle navigation
    const goToPage = () => {
      navigate('/SteganographyComponent'); 
      
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
      <button onClick={goToPage}>Send/Decode hidden message</button>
      <Messages />
      <Input/>
    </div>
  );
};

export default Chat;
