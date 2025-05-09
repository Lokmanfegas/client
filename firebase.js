import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCIYGRgZELXG7JvOa7TRIoFgzeJRfTDop4",
  authDomain: "notificaton-pfe.firebaseapp.com",
  projectId: "notificaton-pfe",
  storageBucket: "notificaton-pfe.firebasestorage.app",
  messagingSenderId: "92382619480",
  appId: "1:92382619480:web:eeeedbe2ce24c91ce0272d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Connexion anonyme automatique
signInAnonymously(auth).catch((error) => {
  console.error("Erreur d'authentification anonyme :", error.message);
});

// Pour vérifier l'utilisateur connecté si besoin
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("✅ Utilisateur connecté :", user.uid);
  } else {
    console.log("❌ Aucun utilisateur connecté");
  }
});

export { db, auth };


