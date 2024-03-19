/**
 * * Sidebar component: 
 * Serves as a container for the primary interactive elements on the side of 
 * the chat application's UI. It aggregates the `Navbar`, `Search`, and `Chats` components, 
 *facilitating user navigation, search functionality, and access to chat conversations. 
 * 
 * * Structure:
  *Navbar: Displays the top navigation bar, including user information and a logout option.
  *Search: Allows users to search for other users by their display names and initiate new chats.
  *Chats**: Lists the current user's ongoing chat conversations, enabling quick access and management of chats.
 
 */


import React from "react";
import Navbar from "./Navbar"
import Search from "./Search"
import Chats from "./Chats"

const Sidebar = () => {
  return (
    <div className="sidebar">
      <Navbar /> {/* Render Navbar at the top of the sidebar */}
      <Search/> {/* Render Search component below the Navbar for user search functionality */}
      <Chats/> {/* Render Chats component to list current user's chat conversations */}
    </div>
  );
};

export default Sidebar;
