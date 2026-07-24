import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
 
const firebaseConfig = {
  apiKey: "AIzaSyBH6lVCeKODuFfMXDYNP6Cd_gkr6xJfpSk",
  authDomain: "bookxrecs.firebaseapp.com",
  projectId: "bookxrecs",
  storageBucket: "bookxrecs.firebasestorage.app",
  messagingSenderId: "726625082035",
  appId: "1:726625082035:web:d65f86516a37be67d72ec6"
};
 
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
