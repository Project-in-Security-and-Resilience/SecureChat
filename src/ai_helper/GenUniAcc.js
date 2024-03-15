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