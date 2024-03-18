/**
 ** ShowPrivateKey Component:
 * The ShowPrivateKey component provides functionality for users to securely view and copy
 *  their private encryption key. It is designed with security and ease of use in mind,
 *  allowing users to manage their private key within a modal interface. This component 
 * is particularly useful in applications that require encryption for user communications.
 * 
 ** Dependencies:
 * - React's useContext and useState hooks for state management and context access.
 * - AuthContext to access the current authenticated user's information.
 * - fetchPrivateKey function to retrieve the user's private key from storage.
 * 
 ** State:
 * - privateKey: Stores the user's private key.
 * - error: Captures and displays any errors encountered while fetching the private key.
 * - showModal: Controls the visibility of the modal containing the private key.
 * 
 ** Key Features:
 * - Securely fetches and displays the user's private key using the fetchPrivateKey function.
 * - Offers a modal interface for viewing the private key, enhancing user experience and security.
 * - Provides a copy functionality, allowing users to easily copy their private key to the clipboard.
 * - Error handling to inform users if there's an issue accessing their private key.
 * 
 ** Event Handlers:
 * - handleShowPrivateKey: Triggered by a button click to show the private key modal.
 * - handleCloseModal: Closes the modal and clears the privateKey state.
 * - handleCopyPrivateKey: Copies the displayed private key to the clipboard.

 */
// import all the neccessary components
import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { fetchPrivateKey } from "./Message";

const ShowPrivateKey = () => {
  const { currentUser } = useContext(AuthContext);
  const [privateKey, setPrivateKey] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Function to handle the display of the private key within a modal
  const handleShowPrivateKey = () => {
    try {
      const key = fetchPrivateKey(currentUser.uid);
      setPrivateKey(key);
      setError(null);
      setShowModal(true);
    } catch (error) {
      setError(error.message);
    }
  };

   // Function to close the modal and reset relevant state
  const handleCloseModal = () => {
    setShowModal(false);
    setPrivateKey(null);
  };

  // Function to copy the displayed private key to the clipboard
  const handleCopyPrivateKey = () => {
    navigator.clipboard.writeText(privateKey);
    alert("Private key copied to clipboard");
  };

  return (
    <div className="showPrivateKeyContainer">
      <button onClick={handleShowPrivateKey}>Reveal E2E Private Key</button> {/* Button to trigger the display of the private key */}
      {showModal && (
        <div className="modal">
          <div className="modalContent">
            <span className="closeButton" onClick={handleCloseModal}>&times;</span>
            <textarea rows={5} cols={50} value={privateKey} readOnly /> {/* Textarea for the private key, read-only */}
            <div className="buttonGroup">
              <button onClick={handleCopyPrivateKey}>Copy</button> {/* Button to copy the private key */}
              <button onClick={handleCloseModal}>Close</button> {/* Button to close the modal */}
            </div>
          </div>
        </div>
      )}
      {error && <p className="error">Error: {error}</p>}
    </div>
  );
};

export default ShowPrivateKey;
