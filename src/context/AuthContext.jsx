import { createContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";


export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({});

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      console.log(user);
    });

    return () => {
      unsub();
    };
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
