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
exports.getAllFiles = exports.uploadFile = void 0;
exports.downloadS3Folder = downloadS3Folder;
exports.copyFinalDist = copyFinalDist;
require("dotenv/config");
const app_1 = require("firebase/app");
const storage_1 = require("firebase/storage");
const fs_1 = __importDefault(require("fs"));
require("dotenv/config");
const path_1 = __importDefault(require("path"));
const https_1 = __importDefault(require("https"));
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
const app = (0, app_1.initializeApp)(firebaseConfig);
const storage = (0, storage_1.getStorage)(app);
function downloadS3Folder(prefix) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Create reference to the folder
            const folderRef = (0, storage_1.ref)(storage, `003-quick-deploy-vercel-clone/${prefix}`);
            // list all items in the folder
            const result = yield (0, storage_1.listAll)(folderRef);
            // Create an array of promises for downloading each file
            const downloadPromises = result.items.map((itemRef) => __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        // get the download URL
                        const downloadURL = yield (0, storage_1.getDownloadURL)(itemRef);
                        // create the final output path
                        const finalOutputPath = path_1.default.join(__dirname, itemRef.fullPath.replace("003-quick-deploy-vercel-clone/", ""));
                        // create directory if it is not exist
                        const dirName = path_1.default.dirname(finalOutputPath);
                        if (!fs_1.default.existsSync(dirName)) {
                            fs_1.default.mkdirSync(dirName, { recursive: true });
                        }
                        // create write stream
                        const outputFile = fs_1.default.createWriteStream(finalOutputPath);
                        // Download the file using https
                        https_1.default
                            .get(downloadURL, (response) => {
                            response
                                .pipe(outputFile)
                                .on("finish", () => {
                                console.log("Downloaded file : ", itemRef.fullPath);
                                resolve("");
                            })
                                .on("error", (error) => {
                                reject(error);
                            });
                        })
                            .on("error", (error) => {
                            reject(error);
                        });
                    }
                    catch (error) {
                        console.log(error);
                        reject(error);
                    }
                }));
            }));
            // handle nested folders
            const folderPromises = result.prefixes.map((folderPath) => __awaiter(this, void 0, void 0, function* () {
                return downloadS3Folder(folderPath.fullPath.replace("003-quick-deploy-vercel-clone/", ""));
            }));
            console.log("Awaiting download..");
            yield Promise.all([...downloadPromises, ...folderPromises]);
            console.log("Download complete folder : ", prefix);
        }
        catch (error) {
            console.log(error);
        }
    });
}
function copyFinalDist(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const folderPath = path_1.default.join(__dirname, `output/${id}/dist`);
        const allFiles = (0, exports.getAllFiles)(folderPath);
        for (const file of allFiles) {
            const resolveFile = path_1.default.resolve(file);
            yield (0, exports.uploadFile)(`dist/${id}/` + resolveFile.slice(folderPath.length + 1).replace(/\\/g, "/"), file);
        }
    });
}
const uploadFile = (fileName, localFilePath) => __awaiter(void 0, void 0, void 0, function* () {
    console.log({ fileName });
    console.log({ localFilePath });
    const filesRef = (0, storage_1.ref)(storage, "003-quick-deploy-vercel-clone/" + fileName);
    const fileContent = fs_1.default.readFileSync(localFilePath);
    (0, storage_1.uploadBytes)(filesRef, fileContent).then((snapshot) => {
        console.log("uploaded");
    });
});
exports.uploadFile = uploadFile;
const getAllFiles = (folderPath) => {
    let response = [];
    const allFilesAndFolders = fs_1.default.readdirSync(folderPath);
    allFilesAndFolders.forEach((file) => {
        const fullFilePath = path_1.default.join(folderPath, file);
        if (fs_1.default.statSync(fullFilePath).isDirectory()) {
            response = response.concat((0, exports.getAllFiles)(fullFilePath));
        }
        else {
            response.push(fullFilePath);
        }
    });
    return response;
};
exports.getAllFiles = getAllFiles;
