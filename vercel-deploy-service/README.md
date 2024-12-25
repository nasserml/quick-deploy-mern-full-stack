# Vercel Deploy Service

## Overview

This project is a backend service designed to mimic some of the deployment functionalities found in Vercel. It leverages Firebase for storage, Redis for queuing, and Node.js for the core logic. The service allows you to queue projects for building and deployment, handles the build process using npm, and then uploads the built artifacts to Firebase Storage.

## Project Structure

The project is structured into three main components:

*   **`firebase.ts`**: Handles interactions with Firebase Storage, including downloading source files from a specified prefix and uploading built files.
*   **`index.ts`**: The main entry point of the service. It listens to a Redis queue for build requests, orchestrates the build process, and updates the deployment status in Redis.
*   **`utils.ts`**: Contains utility functions, primarily the `buildProject` function responsible for executing npm install and npm run build within the project directory.

## Dependencies

The project has the following dependencies:

*   **Node.js (>= 18.0.0 recommended)**
*   **`@types/dotenv`**: TypeScript definitions for dotenv.
*   **`@types/node`**: TypeScript definitions for Node.js.
*   **`@types/redis`**: TypeScript definitions for Redis.
*   **`dotenv`**: Loads environment variables from a .env file.
*   **`firebase`**: Firebase SDK for interacting with Firebase services (Storage in this case).
*   **`redis`**: Redis client library for Node.js.

## Setup and Configuration

1. **Firebase Project:**
    *   Create a Firebase project in the Firebase console.
    *   Enable Firebase Storage for your project.
    *   Obtain your Firebase project configuration (apiKey, authDomain, etc.).

2. **Redis Instance:**
    *   Set up a Redis instance. You can use a local Redis server or a cloud-based Redis service.

3. **Environment Variables:**
    *   Create a `.env` file in the root of the project.
    *   Add the following environment variables to the `.env` file, replacing the placeholders with your actual values:
    ```
    FIREBASE_API_KEY=your_api_key
    FIREBASE_AUTH_DOMAIN=your_auth_domain
    FIREBASE_DATABASE_URL=your_database_url
    FIREBASE_PROJECT_ID=your_project_id
    FIREBASE_STORAGE_BUCKET=your_storage_bucket
    REDIS_HOST=your_redis_host
    REDIS_PORT=your_redis_port
    REDIS_PASSWORD=your_redis_password (if applicable)
    ```

4. **Install Dependencies:**

    ```bash
    npm install
    ```

## Build and Run

1. **Build the project:**

    ```bash
    npm run build
    ```
    This will compile the TypeScript code and start the service.

## Usage

### Deployment Workflow

1. **Project Upload:**
    *   Your frontend application (or any project you want to deploy) needs to be uploaded to Firebase Storage under a specific prefix. This can be done manually or through a separate process. The suggested folder structure is `003-quick-deploy-vercel-clone/output/{id}`, where `{id}` is a unique identifier for your project.

2. **Enqueue Build Request:**
    *   Push the project ID (`{id}`) to the Redis queue named `build-queue`. This will trigger the service to start the deployment process.

3. **Service Operations:**

    *   **`index.ts`** will listen to the `build-queue` and pick up the project ID.
    *   **`firebase.ts`** will download the project files from Firebase Storage to the local `output/{id}` directory.
    *   **`utils.ts`** will execute `npm install` and `npm run build` inside the `output/{id}` directory to build the project.
    *   **`firebase.ts`** will upload the contents of the `output/{id}/dist` folder to the `dist/{id}` location in Firebase Storage.
    *   The service will update the status of the deployment in Redis under the key `status:{id}` to `deployed`.

## Code Explanation

### `firebase.ts`

*   **`firebaseConfig`:**  Firebase configuration object loaded from environment variables.
*   **`app`:** Initializes the Firebase app.
*   **`storage`:** Gets a reference to the Firebase Storage service.
*   **`downloadS3Folder(prefix)`:**
    *   Recursively downloads files and folders from Firebase Storage based on the provided prefix.
    *   Creates local directories as needed to mirror the Firebase Storage structure.
    *   Uses `https` module to download files and write them to the local filesystem.
*   **`copyFinalDist(id)`:**
    *   Uploads the contents of the `output/{id}/dist` folder to Firebase Storage after the build is complete.
    *   Uses `getAllFiles` to get a list of all files within the `dist` directory.
    *   Calls `uploadFile` to upload each file individually.
*   **`uploadFile(fileName, localFilePath)`:**
    *   Uploads a single file to Firebase Storage.
    *   `fileName` determines the path and name of the file in Firebase Storage.
    *   `localFilePath` is the path to the file on the local filesystem.
*   **`getAllFiles(folderPath)`:**
    *   Recursively traverses a directory and returns an array of all file paths within it.

### `index.ts`

*   **`subscriber` and `publisher`:** Creates Redis clients for subscribing to the queue and publishing status updates.
*   **`main()`:**
    *   Enters an infinite loop that listens to the `build-queue`.
    *   Uses `brPop` to wait for and retrieve a project ID from the queue.
    *   Calls `downloadS3Folder` to download the project.
    *   Calls `buildProject` to build the project.
    *   Calls `copyFinalDist` to upload the built files.
    *   Updates the deployment status in Redis using `hSet`.

### `utils.ts`

*   **`buildProject(id)`:**
    *   Executes `npm install` and `npm run build` in the project directory using the `child_process` module.
    *   Uses promises to handle the asynchronous execution of the commands.

## Notes

*   The code assumes that the project being built has a `package.json` file with `install` and `build` scripts defined.
*   Error handling can be improved in several places, such as adding more specific error handling in the Redis and Firebase interactions.
*   The project structure and naming conventions are based on the Vercel example provided. You can adapt them to your preferences.

## Future Enhancements

*   **More Robust Error Handling:** Add more comprehensive error handling and logging throughout the service.
*   **Configurable Build Commands:** Allow users to specify custom build commands instead of relying solely on `npm install` and `npm run build`.
*   **Authentication:** Implement authentication to secure the deployment process.
*   **Webhooks:** Add support for webhooks to notify external systems about deployment status changes.
*   **Scaling:** Consider strategies for scaling the service to handle a large number of concurrent deployments (e.g., using a worker pool or a more sophisticated queuing system).