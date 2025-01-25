// Importa las funciones necesarias de Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAKkwc6mPpLQ50imVxNgtEel5yK9xMI8Do",
  authDomain: "arqui1-89419.firebaseapp.com",
  projectId: "arqui1-89419",
  storageBucket: "arqui1-89419.firebasestorage.app",
  messagingSenderId: "236385527406",
  appId: "1:236385527406:web:8ec679ac211e281739687f",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Firestore
const db = getFirestore(app);
export const auth = getAuth(app);


export { db };
