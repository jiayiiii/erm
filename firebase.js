import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  authDomain: "veact-47948.firebaseapp.com",
  projectId: "veact-47948",
  storageBucket: "veact-47948.appspot.com", 
  messagingSenderId: "618279704965",
  appId: "1:618279704965:web:fe81c9bf820f902ed24cec",
  measurementId: "G-6R8DHW4M2Y"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);