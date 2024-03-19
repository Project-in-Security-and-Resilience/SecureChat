/**
 ** AuthContextProvider:
 * The AuthContextProvider component manages the authentication state across the application
 *  using Firebase Authentication. It monitors user sign-in states, handles sign-out, and manages RSA key pairs for encryption. The component also includes functions for generating RSA key pairs and decrypting messages using the Web Crypto API, enhancing security for user communications.
 * 
 ** Dependencies:
 * - React (useState, useEffect, createContext) for state management and context creation.
 * - Firebase/auth for authentication functionalities.
 * - Firebase/firestore for storing and retrieving user data, specifically RSA public keys.
 * - Web Crypto API for cryptographic operations, including RSA key pair generation and message decryption.
 * 
 * State:
 * - currentUser: Holds the currently authenticated user's information.
 * 
 * Functions:
 * - generateKeyPair(): Generates an RSA key pair using the Web Crypto API, returning the keys 
 *   in Base64 encoded strings.
 * - decryptMessage(encryptedMessage, key, iv): Decrypts an encrypted message with AES-GCM using
 *  the provided key and initialization vector (IV).
 * 

 */




import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Function to generate RSA key pair using Web Crypto API
export async function generateKeyPair() {
  try {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // Equivalent to '65537'
        hash: "SHA-256"
      },
      true,
      ["encrypt", "decrypt"]
    );

    // Exporting keys to SPKI (public key) and PKCS#8 (private key) formats
    const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
    const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    // Convert ArrayBuffer to Base64 string
    const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKey)));
    const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(privateKey)));

    return { publicKey: publicKeyBase64, privateKey: privateKeyBase64 };
  } catch (error) {
    console.error("Error generating RSA key pair:", error);
    throw error;
  }
}

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Check if user's public key exists in Firestore
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists() || !docSnap.data().publicKey) {
          // Generate a new key pair if public key doesn't exist
          const { publicKey, privateKey } = await generateKeyPair();
          // Store the public key in Firestore
          await setDoc(userRef, { publicKey },{ merge: true });
          // Store the private key securely in browser local storage
          localStorage.setItem(`${user.uid}_privateKey`, privateKey);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Function to handle user inactivity and logout
  const handleUserInactivity = () => {
    // Perform logout actions here (e.g., sign out from Firebase)
    signOut(auth).then(() => {
      setCurrentUser(null);
    }).catch((error) => {
      console.log(error.message);
    });
  };

  useEffect(() => {
    let inactivityTimer;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(handleUserInactivity, 300000); // Logout after 5 minutes of inactivity
    };

    resetTimer(); // Initial call

    // Reset the timer on user activity
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keypress", resetTimer);

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keypress", resetTimer);
    };
  }, []);

  // Function to handle user sign out
  const handleSignOut = () => {
    signOut(auth).then(() => {
      setCurrentUser(null);
    }).catch((error) => {
      console.log(error.message);
    });
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault(); // Prompt will be shown
      event.returnValue = ""; // Chrome requires returnValue to be set
      handleSignOut(); // Sign out the user
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
