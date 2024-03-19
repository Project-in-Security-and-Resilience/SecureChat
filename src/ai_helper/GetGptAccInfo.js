/**
 ** GptAccInfo:
 * GptAccInfo is an asynchronous function designed to fetch and return information about a specific GPT 
 * (Generative Pre-trained Transformer) account stored in Firestore. This account is identified by a unique email 
 * address defined in the `gptAccountInfos` object. The function queries the Firestore database for a user document
 *  matching this email and retrieves the document's data.
 * 
 **  Dependencies:
 * - Firebase Firestore (db): Utilized for querying user data stored in the Firestore database.
 * - gptAccountInfos: A JavaScript object imported from "UNIQUE_GPT_ACCOUNT.js", containing predefined 
 * information such as the email address used to identify the GPT account in Firestore.
 * 
 **  Process Flow:
 * 1. Constructs a query targeting the "users" collection in Firestore, specifically looking for a document
 *  where the email field matches the email defined in `gptAccountInfos`.
 * 2. Executes the query to fetch matching documents.
 * 3. If a matching document is found (indicating the GPT account exists), extracts and stores the document's 
 * data in the `accountData` object.
 * 4. If no matching document is found or an error occurs during the query execution, `accountData` remains an
 *  empty object.
 * 
 */




// imports
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


