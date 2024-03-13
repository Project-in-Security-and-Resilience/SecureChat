// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyBDViHCUjJgx0FwxgFZbDw_eBk5aYPg0fM",
  authDomain: "draft-736b4.firebaseapp.com",
  projectId: "draft-736b4",
  storageBucket: "draft-736b4.appspot.com",
  messagingSenderId: "502908030880",
  appId: "1:502908030880:web:0b64586fc32051f600dec5"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore()