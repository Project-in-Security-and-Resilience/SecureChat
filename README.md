
## [🏁](https://emojipedia.org/chequered-flag/) Getting Started


##### Documentations Used:

## ⚙️ Requirements & Installation

### ⚠ Requried environment variables

ℹ You either place .env file in the root directory or populate the environment

sample .env file

```
# database
VITE_GPTapiKey=secret
VITE_FirebaseAPIKEY=secret
```

### ⚠ Requried environment variables

ℹ Create an app on firebase and update FIrebase configuration in firebase.jsx, Do not change the apiKey import statement

```
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FirebaseAPIKEY,
  authDomain: "chatapp-4d7ad.firebaseapp.com",
  projectId: "chatapp-4d7ad",
  storageBucket: "chatapp-4d7ad.appspot.com",
  messagingSenderId: "105274351407",
  appId: "1:105274351407:web:0b765e291374dbc70f4bda",
  measurementId: "G-4WFS8PLZ7Y"
};
```

### Installation

Install Node.js and yarn package manager.

## [🚀](https://emojipedia.org/rocket/) Deployment/Update

1. Deploy on Localhost

   ```
   yarn run dev
   ```
2. Deploy on any server (use the command to generate build files in /dist directory)

   ```
   yarn run build
   ```

## 👨‍💻 Usage
https://youtu.be/gqsp-OPTtIk

## [🎚️](https://emojipedia.org/level-slider/)Debugging

## [🪪](https://emojipedia.org/identification-card/) License

MIT
