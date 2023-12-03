// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB5H1xC2ySOdFuQJCaFVYyl6CqAyDQ6t0w",
  authDomain: "bday-ad1e0.firebaseapp.com",
  projectId: "bday-ad1e0",
  storageBucket: "bday-ad1e0.appspot.com",
  messagingSenderId: "243927855656",
  appId: "1:243927855656:web:6b7b2bdec9e8bb48873b1d",
  measurementId: "G-XS7842LH6M",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

export const db = getFirestore(app);
