import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAI4v2t1T8xjSQXhn-2abEIm4hMVHTDjRk",
  authDomain: "omtech-chat.firebaseapp.com",
  projectId: "omtech-chat",
  storageBucket: "omtech-chat.firebasestorage.app",
  messagingSenderId: "423921429629",
  appId: "1:423921429629:web:6fa6442d6896298b1c1514"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);