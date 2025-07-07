// Importa funções necessárias do Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuração do seu projeto Firebase (copiada do console)
const firebaseConfig = {
  apiKey: "AIzaSyDZgKIPMCCJLMRX9vDEUoaKL6d16ecHsgs",
  authDomain: "festa-junina-f7b31.firebaseapp.com",
  projectId: "festa-junina-f7b31",
  storageBucket: "festa-junina-f7b31.appspot.com", // Corrigi aqui, era firebasestorage.app (errado)
  messagingSenderId: "498278327957",
  appId: "1:498278327957:web:95cf12306e29e8be13dd9c",
  measurementId: "G-LPVKBZ5FX7"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Firestore
export const db = getFirestore(app);
