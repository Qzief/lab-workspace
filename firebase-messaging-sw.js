importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD9V0fG_bgxTcgcXQCfVLpvC-kjKeZBsiw",
  authDomain: "arufkuy-login-register.firebaseapp.com",
  projectId: "arufkuy-login-register",
  messagingSenderId: "334457785991",
  appId: "1:334457785991:web:a36fcfad9436c54f4b3222"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('📩 Pesan background diterima: ', payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icon.png' // opsional
  });
});
