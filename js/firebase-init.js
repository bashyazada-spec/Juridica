import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, onSnapshot, limit, serverTimestamp, where, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDIDs21G2wWy-Wd72wb-iWNMCTy0_KlADo",
  authDomain: "simando.firebaseapp.com",
  projectId: "simando",
  storageBucket: "simando.firebasestorage.app",
  messagingSenderId: "625959608817",
  appId: "1:625959608817:web:0c571d94f720658e97a450",
  measurementId: "G-FMM7Y60XK0"
};

try {
  const app = initializeApp(firebaseConfig);
  const db  = getFirestore(app);
  window._db = db;
  window._fbCol    = collection;
  window._fbAddDoc = addDoc;
  window._fbGetDocs= getDocs;
  window._fbDoc    = doc;
  window._fbUpdate = updateDoc;
  window._fbDelete = deleteDoc;
  window._fbQuery  = query;
  window._fbOrderBy= orderBy;
  window._fbOnSnapshot  = onSnapshot;
  window._fbLimit       = limit;
  window._fbServerTs    = serverTimestamp;
  window._fbWhere       = where;
  window._fbSet         = setDoc;
  window._fbReady  = true;
  document.dispatchEvent(new Event("firebase-ready"));
} catch (err) {
  console.error("Firebase module init failed:", err);
  window._fbReady = false;
  document.dispatchEvent(new Event("firebase-ready"));
}
