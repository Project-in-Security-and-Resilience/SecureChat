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



// Function to decrypt an encrypted message using a provided encryption key and IV
async function decryptMessage(encryptedMessage, key, iv) {
  // Decrypt the encrypted message using the provided encryption key and IV
  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encryptedMessage
  );

  // Convert the decrypted ArrayBuffer to a string
  const decryptedMessage = new TextDecoder().decode(decryptedData);

  // Return the decrypted message
  return decryptedMessage;
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
