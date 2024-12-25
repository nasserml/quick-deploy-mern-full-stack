"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app_1 = require("firebase/app");
const storage_1 = require("firebase/storage");
require("dotenv/config");
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
const app1 = (0, app_1.initializeApp)(firebaseConfig);
const storage = (0, storage_1.getStorage)(app1);
const app = (0, express_1.default)();
app.get("/*", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const host = req.hostname;
    console.log(host);
    const id = host.split(".")[0];
    const filePath = req.path;
    const fileRef = (0, storage_1.ref)(storage, `003-quick-deploy-vercel-clone/dist/${id}/${filePath}`);
    const contents = yield (0, storage_1.getBytes)(fileRef);
    const type = filePath.endsWith("html")
        ? "text/html"
        : filePath.endsWith("css")
            ? "text/css"
            : "application/javascript";
    // set content tyoe and send response
    res.set("Content-Type", type);
    res.send(Buffer.from(contents));
}));
app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
