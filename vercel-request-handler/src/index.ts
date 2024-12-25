import express from "express";
import { initializeApp } from "firebase/app";
import { getStorage, ref, getBytes } from "firebase/storage";
import "dotenv/config";
import cors from "cors";
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
const app1 = initializeApp(firebaseConfig);

const storage = getStorage(app1);

const app = express();
app.use(cors());

app.get("/*", async (req, res) => {
  const host = req.hostname;
  console.log(host);
  const id = host.split(".")[0];
  const filePath = req.path;

  const fileRef = ref(
    storage,
    `003-quick-deploy-vercel-clone/dist/${id}/${filePath}`
  );

  const contents = await getBytes(fileRef);

  const type = filePath.endsWith("html")
    ? "text/html"
    : filePath.endsWith("css")
    ? "text/css"
    : "application/javascript";

  // set content tyoe and send response
  res.set("Content-Type", type);
  res.send(Buffer.from(contents));
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
