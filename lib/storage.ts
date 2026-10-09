import { S3Client } from "@aws-sdk/client-s3";

export function getStorageClient() {
  const bucket = process.env.S3_BUCKET;
  const region = process.env.AWS_REGION ?? "auto";
  const endpoint = process.env.S3_ENDPOINT;
  if (!bucket || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("S3_BUCKET and AWS credentials must be configured.");
  }
  return {
    bucket,
    client: new S3Client({ region, endpoint: endpoint || undefined, forcePathStyle: Boolean(endpoint) }),
  };
}
