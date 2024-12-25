# Quick Deploy MERN Full Stack - Vercel Back End Clone

This project is a simplified clone of Vercel's deployment system, built using the MERN stack (MongoDB, Express, React, Node.js). It demonstrates how to deploy a Git repository to a cloud environment, leveraging Firebase for storage and Redis for managing build queues and statuses.

## Project Structure

The project contains the following key files and directories:

-   **`vercel/`**: Contains the backend server code.
    -   **`dist/`**: Output directory for compiled TypeScript code.
        -   **`file.js`**: Contains the `getAllFiles` function to recursively retrieve all files within a specified directory.
        -   **`firebase.js`**: Implements Firebase integration for uploading files to Firebase Storage.
        -   **`index.js`**: The main server file, handling API routes for deployment and status checks.
        -   **`utils.js`**: Provides a utility function `generate` to create random unique IDs.
    -   **`src/`**: TypeScript source code for the backend server.
        -   **`file.ts`**: TypeScript version of `file.js`.
        -   **`firebase.ts`**: TypeScript version of `firebase.js`.
        -   **`index.ts`**: TypeScript version of `index.js`.
        -   **`utils.ts`**: TypeScript version of `utils.js`.
    -   **`package.json`**: Defines project dependencies and scripts.
    -   **`package-lock.json`**: Records the exact versions of dependencies used in the project.
    -   **`tsconfig.json`**: Configuration file for TypeScript compilation.

## Core Functionality

### File Upload (`file.ts`, `file.js`)

-   **`getAllFiles(folderPath: string): string[]`**: This function recursively traverses a given directory (`folderPath`) and returns an array of strings, where each string is the full path to a file within that directory or its subdirectories.

### Firebase Integration (`firebase.ts`, `firebase.js`)

-   **Firebase Configuration**: The `firebase.ts` file initializes a Firebase app using configuration details from environment variables (`process.env.FIREBASE_*`). These variables need to be set in a `.env` file.
-   **`uploadFile(fileName: string, localFilePath: string): Promise<void>`**: This function uploads a file to Firebase Storage. It takes the desired file name in Firebase Storage (`fileName`) and the local path of the file (`localFilePath`). It then uploads the file content to the specified Firebase Storage bucket under the path "003-quick-deploy-vercel-clone/".

### Main Server (`index.ts`, `index.js`)

-   **Dependencies**: The server uses Express for handling HTTP requests, `cors` for enabling Cross-Origin Resource Sharing, `simple-git` for Git operations, `path` for file path manipulation, `redis` for interacting with a Redis server and `dotenv` for environment variable management.
-   **Redis Integration**:
    -   Uses Redis to manage the build queue and deployment statuses.
    -   Creates a Redis publisher and subscriber for inter-process communication.
-   **API Endpoints**:
    -   **`POST /deploy`**:
        -   Accepts a `repoUrl` in the request body.
        -   Generates a unique ID for the deployment.
        -   Clones the Git repository specified by `repoUrl` into a local directory named `output/{id}`.
        -   Uses `getAllFiles` to get a list of all files in the cloned repository.
        -   Uploads each file to Firebase Storage using `uploadFile`.
        -   Adds the deployment ID to a Redis list named "build-queue".
        -   Sets the deployment status to "uploaded" in a Redis hash named "status".
        -   Returns the generated deployment ID in the response.
    -   **`GET /status`**:
        -   Accepts a deployment `id` as a query parameter.
        -   Retrieves the deployment status from the Redis hash "status" using the provided ID.
        -   Returns the status in the response.

### Utility Functions (`utils.ts`, `utils.js`)

-   **`generate(): string`**: This function generates a random lowercase alphanumeric string of length `MAX_LEN` (defined as 5) to be used as a unique identifier.

## Setup and Installation

1. **Clone the Repository:**
    ```bash
    git clone https://github.com/nasserml/quick-deploy-mern-full-stack.git
    cd quick-deploy-mern-full-stack-main/vercel
    ```

2. **Install Dependencies:**
    ```bash
    npm install
    ```

3. **Firebase Setup:**
    -   Create a Firebase project and enable Firebase Storage.
    -   Obtain your Firebase configuration details (API key, auth domain, etc.).
    -   Create a `.env` file in the `vercel` directory and add your Firebase configuration:

    ```
    FIREBASE_API_KEY=<your-api-key>
    FIREBASE_AUTH_DOMAIN=<your-auth-domain>
    FIREBASE_DATABASE_URL=<your-database-url>
    FIREBASE_PROJECT_ID=<your-project-id>
    FIREBASE_STORAGE_BUCKET=<your-storage-bucket>
    ```

4. **Redis Setup:**
    -   Ensure you have a Redis server running. You can either set up a local Redis instance or use a cloud-based Redis service.
    -  If necessary, update the Redis connection details when creating the Redis clients in `index.ts`.

## Running the Application

1. **Compile TypeScript:**
    ```bash
    tsc -b
    ```

2. **Start the Server:**
    ```bash
    node dist/index.js
    ```

    Alternatively, you can use the `dev` script:

    ```bash
    npm run dev
    ```

The server will start on port 3000.

## Usage

1. **Deploy a Repository:**
    Send a POST request to `/deploy` with the Git repository URL in the request body:

    ```json
    {
      "repoUrl": "https://github.com/nasserml/hello-world-react-test.git"
    }
    ```

    The response will contain the deployment ID:

    ```json
    {
      "id": "generated-id"
    }
    ```

2. **Check Deployment Status:**
    Send a GET request to `/status` with the deployment ID as a query parameter:

    ```
    /status?id=generated-id
    ```

    The response will contain the deployment status:

    ```json
    {
      "status": "uploaded"
    }
    ```

## Notes

-   This is a simplified implementation and does not include features like build steps, custom domains, or environment variables that are typically found in a full-fledged deployment platform like Vercel.
-   The project assumes that the deployed repositories are static websites.
-   Error handling and security measures are minimal for brevity and should be enhanced for production use.

## Future Improvements

-   **Build Process**: Implement a build process to handle projects that require compilation or bundling (e.g., React applications).
-   **Custom Domains**: Add support for custom domains.
-   **Environment Variables**: Allow users to set environment variables for their deployments.
-   **Authentication**: Secure the API with authentication.
-   **Error Handling**: Implement robust error handling and logging.
-   **Scalability**: Enhance the architecture to handle a large number of deployments and scale efficiently.
-   **Frontend**: Develop a frontend interface for a more user-friendly experience.
-   **Database Integration**: Use a database (e.g., MongoDB) to store deployment metadata and history.

