s
// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyANdMpZ5ifPHBAoONY2Jex8LeehJy2s57g",
  authDomain: "merge-battle-8715b.firebaseapp.com",
  projectId: "merge-battle-8715b",
  storageBucket: "merge-battle-8715b.firebasestorage.app",
  messagingSenderId: "777405286368",
  appId: "1:777405286368:web:0ae349ea609bf3f19b0d85"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);