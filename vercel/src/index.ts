import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate } from "./utils";
import path from "path";
import { getAllFiles } from "./file";
import { uploadFile } from "./firebase";
import "dotenv/config";
import {createClient} from "redis"

const publisher = createClient();
publisher.connect();

const subscriber = createClient();
subscriber.connect();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/deploy", async (req, res) => {
  // await uploadFile( "UWNWx\\bot\\package.json".replace(/\\/g, "/"), "G:\\Route-frontend-reactjs\\12-general-projects\\28-Quick-Deploy-vercel-clone-mern-full-stack\\quick-deploy\\vercel\\dist\\output\\UWNWx\\bot\\package.json")

  // const oaths = path.relative("G:\\Route-frontend-reactjs\\12-general-projects\\28-Quick-Deploy-vercel-clone-mern-full-stack\\quick-deploy\\vercel\\dist\\output\\UWNWx\\bot\\package.json", process.cwd())

  // console.log(oaths)

  // console.log(__dirname);

  // console.log(path.resolve(__dirname));

  // res.json({ id: "hello" });

  // return

  const repoUrl = req.body.repoUrl;
  const id = generate();
  // publisher.lPush("build-queue", id);

 
  await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));

  const files = getAllFiles(path.join(__dirname, `output/${id}`));

  for (const file of files) {
    const resolveFile = path.resolve(file);

    await uploadFile(resolveFile.slice(__dirname.length + 1).replace(/\\/g, "/"), file);
  }

  publisher.lPush("build-queue", id);

  // insert into SQl
  // create(mongodb)
  publisher.hSet("status", id, "uploaded")

  // put this to s3

  res.json({ id: id });
});

app.get("/status", async (req, res) => {
  const id = req.query.id;

  const response = await subscriber.hGet("status", id as string);
  res.json({ status: response });

})
app.listen(3000, () => {
  console.log("Server is running on port 3000 hello server");
});
