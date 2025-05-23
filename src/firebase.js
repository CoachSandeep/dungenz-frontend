import { getMessaging, getToken } from "firebase/messaging";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDno7dgGj1MYs7VJaYd6Gnk3MwT26Fa7dk",
  authDomain: "dungenz-fitness.firebaseapp.com",
  projectId: "dungenz-fitness",
  storageBucket: "dungenz-fitness.appspot.com",
  messagingSenderId: "674874757814",
  appId: "1:674874757814:web:1560a541cc2f5c75588c17",
  measurementId: "G-2VGC1V7X2S"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging };
