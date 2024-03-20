const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.deleteExpiredMessages = functions.pubsub
    .schedule("every 1 minutes") // Adjusted to run every 1 minute
    .onRun(async (context) => {
      const now = Date.now();
      const expirationTime = now - 5 * 60 * 1000;

      console.log("Expiration Time:", new Date(expirationTime));

      const chatsCollection = admin.firestore().collection("chats");
      const snapshot = await chatsCollection
          .get();

      console.log("Snapshot Size:", snapshot.size);

      const batch = admin.firestore().batch();

      let messagesDeletedCount = 0;

      snapshot.forEach((doc) => {
        console.log("Document ID:", doc.id);
        const messages = doc.data().messages.filter(
            (message) =>
              message.disappear === true &&
            message.date.toMillis() < expirationTime,
        );
        console.log("Filtered Messages:", messages);
        messages.forEach((message) => {
          batch.update(doc.ref, {
            messages: admin.firestore.FieldValue.arrayRemove(message),
          });

          messagesDeletedCount++;
        });
      });

      if (messagesDeletedCount === 0) {
        console.log("No expired messages found.");
      } else {
        await batch.commit();
        console.log(`${messagesDeletedCount} expired messages deleted`);
      }
    });
