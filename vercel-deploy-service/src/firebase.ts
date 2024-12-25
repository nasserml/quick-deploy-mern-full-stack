import "dotenv/config";
import { initializeApp } from "firebase/app";
import {
  getDownloadURL,
  getStorage,
  listAll,
  ref,
  uploadBytes,
} from "firebase/storage";
import fs from "fs";
import "dotenv/config";
import path from "path";
import https from "https";

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

export async function downloadS3Folder(prefix: string) {

  try {
    // Create reference to the folder

    const folderRef = ref(storage, `003-quick-deploy-vercel-clone/${prefix}`);

    // list all items in the folder
    const result = await listAll(folderRef);

   
    // Create an array of promises for downloading each file

    const downloadPromises = result.items.map(async (itemRef) => {
      return new Promise(async (resolve, reject) => {
        try {
          // get the download URL
          const downloadURL = await getDownloadURL(itemRef);

          // create the final output path
          const finalOutputPath = path.join(
            __dirname,
            itemRef.fullPath.replace("003-quick-deploy-vercel-clone/", "")
          );


          // create directory if it is not exist
          const dirName = path.dirname(finalOutputPath);

          if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName, { recursive: true });
          }

          // create write stream
          const outputFile = fs.createWriteStream(finalOutputPath);

          // Download the file using https
          https
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
        } catch (error) {
          console.log(error);
          reject(error);
        }
      });
    });

    // handle nested folders
    const folderPromises = result.prefixes.map(async (folderPath) => {
      return  downloadS3Folder(folderPath.fullPath.replace("003-quick-deploy-vercel-clone/", ""));
    });

    console.log("Awaiting download..");

    await Promise.all([...downloadPromises, ...folderPromises]);
    console.log("Download complete folder : ", prefix);
  } catch (error) {
    console.log(error);
  }
}


export  async function copyFinalDist(id:string) {
  const folderPath = path.join(__dirname, `output/${id}/dist`);
  const allFiles = getAllFiles(folderPath);
  for (const file of allFiles) {
    const resolveFile= path.resolve(file);

    await uploadFile(`dist/${id}/` + resolveFile.slice(folderPath.length + 1).replace(/\\/g, "/"), file);
    
  }
}



export const uploadFile = async (fileName: string, localFilePath: string) => {
  console.log({ fileName });
  console.log({ localFilePath });
  const filesRef = ref(storage, "003-quick-deploy-vercel-clone/" + fileName);
  const fileContent = fs.readFileSync(localFilePath);
  uploadBytes(filesRef, fileContent).then((snapshot) => {
    console.log("uploaded");
  });
};


export const getAllFiles =  (folderPath: string) => {
  let response: string[] = [];

  const allFilesAndFolders = fs.readdirSync(folderPath);

  allFilesAndFolders.forEach((file) => {
    const fullFilePath = path.join(folderPath, file);
    if (fs.statSync(fullFilePath).isDirectory()) {
      response = response.concat(getAllFiles(fullFilePath));
    } else {
      response.push(fullFilePath);
    }
  });

  return response;
};