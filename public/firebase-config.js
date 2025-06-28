const firebaseConfig = {
  apiKey: "AIzaSyCeFGKkHuIt5PKqDjqBN0uwtOqx96-pC5g",
  authDomain: "zvonok-kqaz.firebaseapp.com",
  projectId: "zvonok-kqaz",
  storageBucket: "zvonok-kqaz.firebasestorage.app",
  messagingSenderId: "653810566275",
  appId: "1:653810566275:web:95e95bc603999eed1dc7b6"
};


firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const messaging = firebase.messaging();