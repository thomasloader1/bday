import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB5H1xC2ySOdFuQJCaFVYyl6CqAyDQ6t0w",
  authDomain: "bday-ad1e0.firebaseapp.com",
  projectId: "bday-ad1e0",
  storageBucket: "bday-ad1e0.appspot.com",
  messagingSenderId: "243927855656",
  appId: "1:243927855656:web:6b7b2bdec9e8bb48873b1d",
  measurementId: "G-XS7842LH6M",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
