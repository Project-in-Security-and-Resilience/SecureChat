import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import googleIcon from '../img/google.png'; // 导入 Google 图标
import facebookIcon from '../img/facebook.png'; // 导入 Facebook 图标
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
        <span className="logo">Love Chat</span>
        <span className="title">Login</span>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input type="email" name="email" placeholder="Enter email" required />
          </div>
          <div className="input-group">
            <input type="password" name="password" placeholder="Password" required />
          </div>
          <button type="submit">Sign In</button>
          {err && <span>Something went wrong</span>}
        </form>
        {showPrivateKeyInput && (
          <div className="formWrapper">
            <p>No private key found. Please enter your private key from your old device:</p>
            <input type="text" value={privateKey} onChange={handlePrivateKeyInputChange} />
            <button className="privateKeyInput" onClick={handleLoginWithPrivateKey}>Login with Private Key</button>
          </div>
        )}
        <div className="social-login">
          <p className="social-login-text">Or continue with</p>
          <div className="social-buttons">
            <button className="social-button google" onClick={() => {/* Google 登录逻辑 */}}>
              <img src={googleIcon} alt="Google" className="social-icon" />
            </button>
            <button className="social-button facebook" onClick={() => {/* Facebook 登录逻辑 */}}>
              <img src={facebookIcon} alt="Facebook" className="social-icon" />
            </button>
          </div>
        </div>
        <div className="register">
          <p>Not a member? <Link to="/register">Register now</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
