// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDno7dgGj1MYs7VJaYd6Gnk3MwT26Fa7dk",
  authDomain: "dungenz-fitness.firebaseapp.com",
  projectId: "dungenz-fitness",
  storageBucket: "dungenz-fitness.firebasestorage.app",
  messagingSenderId: "674874757814",
  appId: "1:674874757814:web:1560a541cc2f5c75588c17",
  measurementId: "G-2VGC1V7X2S"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
