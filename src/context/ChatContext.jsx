/**
 ** ChatContextProvider Component:
 *  The ChatContextProvider is a React component designed to manage and distribute chat-related
 *  state across the application. It leverages React's Context API and useReducer hook to
 *  handle changes in the current chat state, such as selecting a user to chat with 
 *  and setting the chat ID based on user interactions. This context provider is essential 
 * for facilitating communication between users in the chat application.
 * 
 
 ** State:
 * The ChatContextProvider initializes with a default state that includes a chatId set to "null"
 *  and an empty user object. It updates the state based on actions dispatched throughout the application, 
 * particularly when changing the user being chatted with.
 * 
 ** Features:
 * - Dynamically sets the chatId based on the current user and the selected user to chat with, ensuring 
 *   a unique identifier for each chat session.
 * - Provides a centralized context for accessing and managing the current chat's state,
 *   including the selected user's information and the chatId.
 * - Facilitates state management for chat functionalities, making it easier to scale and 
 *  maintain the application.
 * 
 **  Reducer Function (chatReducer):
 * - Handles state transitions based on dispatched actions. Currently supports the
 *  "CHANGE_USER" action, which updates the state with a new user and computes a new chatId.
 * 
 */

import {
  createContext,
  useContext,
  useReducer,
} from "react";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const INITIAL_STATE = {
    chatId: "null",
    user: {},
  };

  const chatReducer = (state, action) => {
    switch (action.type) {
      case "CHANGE_USER":
        return {
          user: action.payload,
          chatId:
            currentUser.uid > action.payload.uid
              ? currentUser.uid + action.payload.uid
              : action.payload.uid + currentUser.uid,
        };
        case "CLEAR_CONTEXT":
          return action.payload;

      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

  return (
    <ChatContext.Provider value={{ data:state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};
