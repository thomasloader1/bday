import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB5H1xC2ySOdFuQJCaFVYyl6CqAyDQ6t0w",
  authDomain: "bday-ad1e0.firebaseapp.com",
  databaseURL: "https://bday-ad1e0-default-rtdb.firebaseio.com",
  projectId: "bday-ad1e0",
  storageBucket: "bday-ad1e0.appspot.com",
  messagingSenderId: "243927855656",
  appId: "1:243927855656:web:6b7b2bdec9e8bb48873b1d",
  measurementId: "G-XS7842LH6M"
};

// Inicializar Firebase solo en el cliente y evitar múltiples inicializaciones
let app;
if (typeof window !== "undefined" && !getApps().length) {
  app = initializeApp(firebaseConfig);
} else if (getApps().length > 0) {
  app = getApps()[0];
}

// Exportar db solo si app está definida (lado del cliente)
export const db = app ? getFirestore(app) : null;
