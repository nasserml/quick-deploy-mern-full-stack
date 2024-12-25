import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";

const BACKEND_UPLOAD_URL = "http://localhost:3000";

const Landing = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [uploadId, setUploadId] = useState("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [deployed, setDeployed] = useState<boolean>(false);

  return (
    <div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">
            Deploy your GitHub Repository
          </CardTitle>
          <CardDescription>
            Enter the URL of your GitHub repository to deploy it
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="github-url"> GitHub Repository URL </Label>
              <Input
                id="github-url"
                placeholder="https://github.com/username/repo-name"
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                }}
              />
            </div>
            <Button
              className="w-full"
              onClick={async () => {
                setUploading(true);
                const res = await axios.post(`${BACKEND_UPLOAD_URL}/deploy`, {
                  repoUrl: repoUrl,
                });

                setUploadId(res.data.id);
                setUploading(false);

                const interval = setInterval(async () => {
                  const response = await axios.get(
                    `${BACKEND_UPLOAD_URL}/status?id=${res.data.id}`
                  );

                  if (response.data.status === "deployed") {
                    clearInterval(interval);
                    setDeployed(true);
                  }
                }, 3000);
              }}
              disabled={uploadId !== "" || uploading}
              type="submit"
            >
              {uploadId
                ? `Deploying ${uploadId}`
                : uploading
                ? "Uploading..."
                : "Upload"}
            </Button>
          </div>
        </CardContent>
      </Card>
      {deployed && (
        <Card className="w-full max-w-md mt-10">
          <CardHeader>
            <CardTitle className="text-2xl">Deployment Status</CardTitle>
            <CardDescription>
              Your website is successfully deployed!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deployed-url">Deployed URL</Label>
                <Input
                  readOnly
                  id="deployed-url"
                  type="url"
                  value={`http://${uploadId}.localhost:3001/index.html`}
                />
              </div>
              <br />
              <Button className="w-full" variant={"outline"}>
                <a
                  href={`http://${uploadId}.localhost:3001/index.html`}
                  target="_blank"
                >Visit Website</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Landing;
