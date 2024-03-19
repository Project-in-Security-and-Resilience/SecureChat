/**
 **  GenUniAcc:
 * GenUniAcc is designed to ensure the existence of a unique GPT account within the application's 
 * Firestore database. It first checks if an account with a predefined email (associated with GPT) exists. 
 * If the account does not exist, the function proceeds to create it, along with authentication credentials,
 *  user profile information, and encryption keys for secure communication.
 * 
 **  Dependencies:
 * - Firebase Firestore (db): For querying and storing user data.
 * - Firebase Authentication (auth): For creating the user account with email and password.
 * - gptAccountInfos: An object containing predefined information about the GPT account, including email, password, displayName, and photoURL.
 * - generateKeyPair function from AuthContext: For generating RSA encryption keys for the new GPT account.
 * 
 ** Process Flow:
 * 1. Queries Firestore to check for the existence of the GPT account by its email.
 * 2. If the account does not exist (res.size === 0), it executes the account creation process:
 *    a. Creates a new user in Firebase Authentication using the predefined email and password.
 *    b. Updates the new user's profile with the predefined displayName and photoURL.
 *    c. Stores the user's information, including uid, displayName, email, and photoURL, in
 *     Firestore under the "users" collection.
 *    d. Generates a new RSA key pair for the account, storing the public key in Firestore
 *  and the private key in local storage.
 *    e. Initializes an empty document in the "userChats" collection for managing user chats.
 *  3. If the account already exists, performs no action.
 */

 //imports used
import {db, auth} from "./MyFirebase.js";
import {collection, doc, setDoc, query, where, getDocs} from "firebase/firestore";
import {createUserWithEmailAndPassword, updateProfile} from "firebase/auth";
import {gptAccountInfos} from "./UNIQUE_GPT_ACCOUNT.js";
import {generateKeyPair} from "../context/AuthContext";


const GenUniAcc = async () => {
// Find the account, then check the account if is unique
    const q = query(collection(db, "users"), where("email", "==", gptAccountInfos.email));
    const res = await getDocs(q);
    console.log(res.size === 0? "Creating the unique gpt account" : "No need to create gpt account")

// not create the unique GPT account, need to create an account (the account of GPT is only one)
    if (res.size === 0) {
        try {
            //Create user
            const res = await createUserWithEmailAndPassword(auth, gptAccountInfos.email, gptAccountInfos.password);

            try {
                //Update profile
                await updateProfile(res.user, {
                    displayName: gptAccountInfos.displayName,
                    photoURL: gptAccountInfos.photoURL,
                });
                //create unique gpt account on firestore
                await setDoc(doc(db, "users", res.user.uid), {
                    uid: res.user.uid,
                    displayName: gptAccountInfos.displayName,
                    email: gptAccountInfos.email,
                    photoURL: gptAccountInfos.photoURL,
                });
                //generate keys
                const { publicKey, privateKey } = await generateKeyPair();
                // Store the public key in Firestore
                await setDoc(doc(db, "users", res.user.uid), { publicKey },{ merge: true });
                // Store the private key securely in browser local storage
                localStorage.setItem(`${res.user.uid}_privateKey`, privateKey);

                //create empty user chats on firestore
                await setDoc(doc(db, "userChats", res.user.uid), {});
            } catch (err) {
                //todo transaction， rollback manually
                console.log(err);
            }

        } catch (err) {
            console.log(err);
        }
    } else {
        // do nothing
    }
};
export default GenUniAcc;