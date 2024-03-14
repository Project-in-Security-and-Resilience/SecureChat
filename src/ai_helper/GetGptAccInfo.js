import {db} from "./MyFirebase.js";
import {collection, query, where, getDocs} from "firebase/firestore";
import {gptAccountInfos} from "./UNIQUE_GPT_ACCOUNT.js";


const GptAccInfo = async () => {
    //Define an array to store the account information
    let accountData = {};
    try {
        // Find the account, then check the account if is unique
        const q = query(collection(db, "users"), where("email", "==", gptAccountInfos.email));
        const res = await getDocs(q);
        if (res.size > 0) {
            // Query the unique document, and only take the data of the first document
            accountData = res.docs[0].data();
        }
    } catch (e) {
        console.log(e);
    }
    //Returns an Object containing the account information
    return accountData;
};

export default GptAccInfo;


