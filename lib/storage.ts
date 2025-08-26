import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.S3_REGION ?? "auto";
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

export const s3 = new S3Client({
  region,
  endpoint: process.env.S3_ENDPOINT, // e.g. https://<accountid>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
});

export async function putObject(params: {
  bucket: string;
  key: string;
  body: Buffer | Uint8Array | Blob | string;
  contentType?: string;
  cacheControl?: string;
}) {
  const cmd = new PutObjectCommand({
    Bucket: params.bucket,
    Key: params.key,
    Body: params.body,
    ContentType: params.contentType,
    CacheControl: params.cacheControl,
  });
  return s3.send(cmd);
}

export async function getSignedGetUrl(bucket: string, key: string, expiresInSeconds = 3600) {
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3, cmd, { expiresIn: expiresInSeconds });
}

export function publicUrlFromKey(key: string) {
  const publicBase = process.env.S3_PUBLIC_BASE_URL; // e.g. https://cdn.example.com
  if (!publicBase) return null;
  return `${publicBase.replace(/\/$/, "")}/${encodeURIComponent(key)}`;
}

