import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { messaging } from './firebase'; // import messaging

// Register your custom service worker
serviceWorkerRegistration.register();

// Register FCM specific service worker separately
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('✅ Firebase SW registered: ', registration);
    })
    .catch((err) => {
      console.error('❌ Firebase SW registration failed:', err);
    });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
