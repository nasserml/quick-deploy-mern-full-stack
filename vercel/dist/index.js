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
const cors_1 = __importDefault(require("cors"));
const simple_git_1 = __importDefault(require("simple-git"));
const utils_1 = require("./utils");
const path_1 = __importDefault(require("path"));
const file_1 = require("./file");
const firebase_1 = require("./firebase");
require("dotenv/config");
const redis_1 = require("redis");
const publisher = (0, redis_1.createClient)();
publisher.connect();
const subscriber = (0, redis_1.createClient)();
subscriber.connect();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post("/deploy", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // await uploadFile( "UWNWx\\bot\\package.json".replace(/\\/g, "/"), "G:\\Route-frontend-reactjs\\12-general-projects\\28-Quick-Deploy-vercel-clone-mern-full-stack\\quick-deploy\\vercel\\dist\\output\\UWNWx\\bot\\package.json")
    // const oaths = path.relative("G:\\Route-frontend-reactjs\\12-general-projects\\28-Quick-Deploy-vercel-clone-mern-full-stack\\quick-deploy\\vercel\\dist\\output\\UWNWx\\bot\\package.json", process.cwd())
    // console.log(oaths)
    // console.log(__dirname);
    // console.log(path.resolve(__dirname));
    // res.json({ id: "hello" });
    // return
    const repoUrl = req.body.repoUrl;
    const id = (0, utils_1.generate)();
    // publisher.lPush("build-queue", id);
    yield (0, simple_git_1.default)().clone(repoUrl, path_1.default.join(__dirname, `output/${id}`));
    const files = (0, file_1.getAllFiles)(path_1.default.join(__dirname, `output/${id}`));
    for (const file of files) {
        const resolveFile = path_1.default.resolve(file);
        yield (0, firebase_1.uploadFile)(resolveFile.slice(__dirname.length + 1).replace(/\\/g, "/"), file);
    }
    publisher.lPush("build-queue", id);
    // insert into SQl
    // create(mongodb)
    publisher.hSet("status", id, "uploaded");
    // put this to s3
    res.json({ id: id });
}));
app.get("/status", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    const response = yield subscriber.hGet("status", id);
    res.json({ status: response });
}));
app.listen(3000, () => {
    console.log("Server is running on port 3000 hello server");
});
