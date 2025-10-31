importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js');

// Konfigurasi proyek Firebase kamu
firebase.initializeApp({
  apiKey: "AIzaSyD9V0fG_bgxTcgcXQCfVLpvC-kjKeZBsiw",
  authDomain: "arufkuy-login-register.firebaseapp.com",
  projectId: "arufkuy-login-register",
  messagingSenderId: "334457785991",
  appId: "1:334457785991:web:a36fcfad9436c54f4b3222"
});

// Inisialisasi messaging
const messaging = firebase.messaging();

// Saat pesan diterima di background
messaging.onBackgroundMessage((payload) => {
  console.log('📬 Pesan background:', payload);
  const { title, body, icon } = payload.notification;

  self.registration.showNotification(title, {
    body,
    icon: icon || 'https://cdn-icons-png.flaticon.com/512/1827/1827349.png'
  });
});
