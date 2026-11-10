import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name} — add Cloudflare R2 credentials to .env`);
  }
  return value;
}

let client: S3Client | null = null;

function getClient() {
  if (client) return client;
  client = new S3Client({
    region: "auto",
    endpoint: required("R2_ENDPOINT"),
    credentials: {
      accessKeyId: required("R2_ACCESS_KEY_ID"),
      secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
    },
  });
  return client;
}

function publicBase() {
  return required("R2_PUBLIC_URL").replace(/\/$/, "");
}

export function isR2Url(url: string) {
  try {
    const base = publicBase();
    return url.startsWith(base) || url.includes(".r2.dev/") || url.includes(".r2.cloudflarestorage.com/");
  } catch {
    return url.includes(".r2.dev/") || url.includes(".r2.cloudflarestorage.com/");
  }
}

export function r2KeyFromUrl(url: string) {
  const base = publicBase();
  if (url.startsWith(base + "/")) return url.slice(base.length + 1);
  try {
    return new URL(url).pathname.replace(/^\//, "");
  } catch {
    return null;
  }
}

export async function uploadToR2(opts: {
  key: string;
  body: Buffer;
  contentType: string;
}) {
  const bucket = required("R2_BUCKET");
  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: opts.key,
      Body: opts.body,
      ContentType: opts.contentType,
    }),
  );
  return `${publicBase()}/${opts.key}`;
}

export async function deleteFromR2(urlOrKey: string) {
  const bucket = required("R2_BUCKET");
  const key = urlOrKey.includes("://")
    ? r2KeyFromUrl(urlOrKey)
    : urlOrKey.replace(/^\//, "");
  if (!key) return;
  await getClient().send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}
