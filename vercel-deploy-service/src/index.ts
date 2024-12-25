import { createClient, commandOptions } from "redis";
import "dotenv/config";
import { copyFinalDist, downloadS3Folder } from "./firebase";
import { buildProject } from "./utils";

const subscriber = createClient();
subscriber.connect();

const publisher = createClient();
publisher.connect();

async function main() {
  while (1) {
    const response = await subscriber.brPop(
      commandOptions({ isolated: true }),
      "build-queue",
      0
    );
    console.log(response);
    const id = response?.element;
    if (id !== undefined) {
      await downloadS3Folder(`output/${id}`);
      console.log("++++++++++++++ downloaded")
      await buildProject(id);
      console.log("++++++++++++++ built ====================")
      await copyFinalDist(id);
      console.log("++++++++++++++ copied dist ====================")
      publisher.hSet("status", id, "deployed")
    }
  }
}


main();

