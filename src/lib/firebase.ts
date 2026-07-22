// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBlWdAa5CSZrbOscMHdP3CZKvxobzk9O4g",
  authDomain: "nusaquest-v2-bd551.firebaseapp.com",
  projectId: "nusaquest-v2-bd551",
  storageBucket: "nusaquest-v2-bd551.firebasestorage.app",
  messagingSenderId: "562860918779",
  appId: "1:562860918779:web:88fa24f15f881c7c6ced5e",
  measurementId: "G-5S2GLQ9B6P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);