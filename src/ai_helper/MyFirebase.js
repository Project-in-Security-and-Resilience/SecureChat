import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {getAuth} from "firebase/auth";
import {getStorage} from "firebase/storage";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
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
const app = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();
