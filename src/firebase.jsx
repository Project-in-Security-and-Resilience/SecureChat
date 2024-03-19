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
  apiKey: "AIzaSyDBPSw7FyyVi-LDKexYIR8b1J51sh9Y0hs",
  authDomain: "chatapp-4d7ad.firebaseapp.com",
  projectId: "chatapp-4d7ad",
  storageBucket: "chatapp-4d7ad.appspot.com",
  messagingSenderId: "105274351407",
  appId: "1:105274351407:web:0b765e291374dbc70f4bda",
  measurementId: "G-4WFS8PLZ7Y"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore()