// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDno7dgGj1MYs7VJaYd6Gnk3MwT26Fa7dk",
  authDomain: "dungenz-fitness.firebaseapp.com",
  projectId: "dungenz-fitness",
  storageBucket: "dungenz-fitness.firebasestorage.app",
  messagingSenderId: "674874757814",
  appId: "1:674874757814:web:1560a541cc2f5c75588c17",
  measurementId: "G-2VGC1V7X2S"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'icons/icon-192-helmet.png' // Your favicon or app icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
