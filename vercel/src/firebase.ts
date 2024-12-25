// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import fs from "fs";
import "dotenv/config";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: "706330481278",
  appId: "1:706330481278:web:bb2936bd0e0ae33852be2f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const storage = getStorage(app);

export const uploadFile = async (fileName: string, localFilePath: string) => {
  console.log({ fileName });
  console.log({ localFilePath });
  const filesRef = ref(storage, "003-quick-deploy-vercel-clone/" + fileName);
  const fileContent = fs.readFileSync(localFilePath);
  uploadBytes(filesRef, fileContent).then((snapshot) => {
    console.log("uploaded");
  });
};
