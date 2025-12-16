// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCzkNXSuJaY19yoLYgYF06EayVeCCo-vuw",
  authDomain: "vidcall-65f7b.firebaseapp.com",
  databaseURL: "https://vidcall-65f7b-default-rtdb.firebaseio.com",
  projectId: "vidcall-65f7b",
  storageBucket: "vidcall-65f7b.firebasestorage.app",
  messagingSenderId: "846259808906",
  appId: "1:846259808906:web:d4116e1980bd0425a51b73",
  measurementId: "G-NT46RXXM45"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);