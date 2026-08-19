import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAsbA9NCFZDhooX-uGTkbiLhpsszkmTRGg",
  authDomain: "ai-interview-platform-98321.firebaseapp.com",
  projectId: "ai-interview-platform-98321",
  storageBucket: "ai-interview-platform-98321.firebasestorage.app",
  messagingSenderId: "731874841360",
  appId: "1:731874841360:web:e33847f267746cf0da0b95",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);