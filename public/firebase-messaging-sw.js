// firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyCeFGKkHuIt5PKqDjqBN0uwtOqx96-pC5g",
  authDomain: "zvonok-kqaz.firebaseapp.com",
  projectId: "zvonok-kqaz",
  storageBucket: "zvonok-kqaz.appspot.com", // ✅ Fixed here
  messagingSenderId: "653810566275",
  appId: "1:653810566275:web:95e95bc603999eed1dc7b6"
});

// Get Messaging
const messaging = firebase.messaging();

// Optional: Handle background push
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);

  self.registration.showNotification("📞 Incoming Call", {
    body: "Someone is calling you!",
    icon: "/icon.png",
    data: {
      url: "/call.html"
    }
  });
});

// Optional: Handle notification click
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});