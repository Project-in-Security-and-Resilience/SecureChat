import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { fetchPrivateKey } from "./Message";

const ShowPrivateKey = () => {
  const { currentUser } = useContext(AuthContext);
  const [privateKey, setPrivateKey] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  const handleCloseModal = () => {
    setShowModal(false);
    setPrivateKey(null);
  };

  const handleCopyPrivateKey = () => {
    navigator.clipboard.writeText(privateKey);
    alert("Private key copied to clipboard");
  };

  return (
    <div className="showPrivateKeyContainer">
      <button onClick={handleShowPrivateKey}>Reveal E2E Private Key</button>
      {showModal && (
        <div className="modal">
          <div className="modalContent">
            <span className="closeButton" onClick={handleCloseModal}>&times;</span>
            <textarea rows={5} cols={50} value={privateKey} readOnly />
            <div className="buttonGroup">
              <button onClick={handleCopyPrivateKey}>Copy</button>
              <button onClick={handleCloseModal}>Close</button>
            </div>
          </div>
        </div>
      )}
      {error && <p className="error">Error: {error}</p>}
    </div>
  );
};

export default ShowPrivateKey;
