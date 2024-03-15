import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const Login = () => {
  const [err, setErr] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  const [showPrivateKeyInput, setShowPrivateKeyInput] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Check if private key exists for the user
      const storedPrivateKey = localStorage.getItem(`${auth.currentUser?.uid}_privateKey`);
      if (!storedPrivateKey) {
        setShowPrivateKeyInput(true);
      } else {
        navigate("/");
      }
    } catch (err) {
      setErr(true);
    }
  };

  const handlePrivateKeyInputChange = (e) => {
    setPrivateKey(e.target.value);
  };

  const handleLoginWithPrivateKey = async () => {
    try {
      // Perform login with private key logic here
      console.log("Logging in with private key:", privateKey);
      // Store the private key locally
      localStorage.setItem(`${auth.currentUser?.uid}_privateKey`, privateKey);
      // Example: Navigate to the next page after successful login
      navigate("/");
    } catch (error) {
      console.error("Error logging in with private key:", error);
      setErr(true);
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo">Lama Chat</span>
        <span className="title">Login</span>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="email" />
          <input type="password" placeholder="password" />
          <button>Sign in</button>
          {err && <span>Something went wrong</span>}
        </form>
        {showPrivateKeyInput && (
          <div className="formWrapper">
            <p>No private key found. Please enter your private key from your old device:</p>
            <input type="text" value={privateKey} onChange={handlePrivateKeyInputChange} />
            <button className="privateKeyInput" onClick={handleLoginWithPrivateKey}>Login with Private Key</button>
          </div>
        )}
        <p>
          You don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
