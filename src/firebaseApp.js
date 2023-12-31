import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import {getStorage} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDCB_8fwvmWuAtiNjC4tQ4ZHJw6rgCfbew",
  authDomain: "netflix-clone-98159.firebaseapp.com",
  projectId: "netflix-clone-98159",
  storageBucket: "netflix-clone-98159.appspot.com",
  messagingSenderId: "488494940109",
  appId: "1:488494940109:web:9d3b18fd908f9a38bfce84",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

export { auth };
export default db;
