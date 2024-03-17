import React, { useState } from "react";
import Add from "../img/addAvatar.png";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db, storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import {generateKeyPair} from "../context/AuthContext";
import SVGComponent from '../components/SVGComponent';

const Register = () => {
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  var isFileSelected = false;

  // Check form info, focusing on Avatar
  const checkInfo = (e) =>{
    //Check if select file
    if (!isFileSelected){
      alert("Please select an Avatar");
    }
  }

  //Check the type of file is Img
  const checkImg = (e) =>{
    const file = e.target.files[0]; // Get the fill selected
    const supportedFormats = ['image/jpeg', 'image/png', 'image/jpg'];

    if (file && !supportedFormats.includes(file.type)) {
      alert('Not support this file, Please choose a Image');
      e.target.value = ''; // Clear the value
    } else {
      // mark file selected
      isFileSelected = true;
    }
  }
  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const displayName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    const file = e.target[3].files[0];

    try {
      //Create user
      const res = await createUserWithEmailAndPassword(auth, email, password);

      //Create a unique image name
      const date = new Date().getTime();
      const storageRef = ref(storage, `${displayName + date}`);

      // Check the image type
      if (!file.type.match('image.*')) {
        alert("Must Only Select Image.");
        e.target[3].value = '';
        return;
      }

      await uploadBytesResumable(storageRef, file).then(() => {
        getDownloadURL(storageRef).then(async (downloadURL) => {
          try {
            //Update profile
            await updateProfile(res.user, {
              displayName,
              photoURL: downloadURL,
            });
            //create user on firestore
            await setDoc(doc(db, "users", res.user.uid), {
              uid: res.user.uid,
              displayName,
              email,
              photoURL: downloadURL,
            });
            //generate keys
            const { publicKey, privateKey } = await generateKeyPair();
            // Store the public key in Firestore
            await setDoc(doc(db, "users", res.user.uid), { publicKey },{ merge: true });
            // Store the private key securely in browser local storage
            localStorage.setItem(`${res.user.uid}_privateKey`, privateKey);

            //create empty user chats on firestore
            await setDoc(doc(db, "userChats", res.user.uid), {});
            navigate("/");
          } catch (err) {
            console.log(err);
            setErr(true);
            setLoading(false);
          }
        });
      });
    } catch (err) {
      setErr(true);
      setLoading(false);
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo"><SVGComponent color="green"/></span>
        <span className="title">Register</span>
        <form onSubmit={handleSubmit}>
          <input required type="text" placeholder="Username" />
          <input required type="email" placeholder="Email" />
          <input required type="password" placeholder="Password" />
          <input required style={{ display: "none" }} type="file" id="file"
                 accept="image/png, image/jpeg, image/jpg" onChange={checkImg} />
          <label htmlFor="file">
            <img style={{width:"30px", height:"30px",cursor:"pointer"}} src={Add} alt=""/>
            <p>Add an avatar</p>
          </label>
          <button disabled={loading} onClick={checkInfo}>Sign up</button>
          {loading && "Uploading and compressing the image please wait..."}
          {err && <span>Something went wrong</span>}
        </form>
        <p>
          You do have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
