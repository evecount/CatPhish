
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your Firebase configuration from the Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyDRN4bttHzn0_-OIiNBJK00GS5jWvGkvFM",
  authDomain: "studio-5036609725-a508c.firebaseapp.com",
  projectId: "studio-5036609725-a508c",
  storageBucket: "studio-5036609725-a508c.firebasestorage.app",
  messagingSenderId: "229587001144",
  appId: "1:229587001144:web:c31793809a8bc7a5d2abcd"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
