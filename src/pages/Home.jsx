/**
 ** Home Component:
 * The Home component acts as the primary layout for the chat application's user interface. 
 * It integrates the Sidebar and Chat components, structuring them within a container to
 *  provide a cohesive and functional chat environment.
 * 
 **  Structure:
 * - A top-level div with a class 'home' wraps the entire component,
 *  serving as the main container for styling and layout purposes.
 * - Inside the 'home' div, there's another div with a class 'container' 
 * that directly contains the Sidebar and Chat components, arranging them side by side within the application's UI.
 * 
 ** Components:
 * - Sidebar: A component that displays the navigation bar, search functionality, 
 * and a list of chats. It allows users to switch between different chats and access 
 *  other functionalities of the application.
 * - Chat: The main area where chat messages are displayed and sent. 
 * It includes message input and display functionalities, enabling real-time communication between users.
 
 */


//  importing necessary components and styles
import React from 'react'
import Sidebar from '../components/Sidebar'
import Chat from '../components/Chat'

const Home = () => {
  return (
    <div className='home'>
      <div className="container">
        <Sidebar/>
        <Chat/>
      </div>
    </div>
  )
}

export default Home