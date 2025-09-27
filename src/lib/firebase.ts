import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAFmYo6-iLe2eRf8dAuVx5-GvL5kmUzyDc",
  authDomain: "show-do-milenio-competicao.firebaseapp.com",
  projectId: "show-do-milenio-competicao",
  storageBucket: "show-do-milenio-competicao.firebasestorage.app",
  messagingSenderId: "178033739661",
  appId: "1:178033739661:web:c6a2d7991748ff36b4dfc4",
  measurementId: "G-TGF2PQ52C5"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
