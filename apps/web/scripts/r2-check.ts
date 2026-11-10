import { readFileSync } from "node:fs";
import path from "node:path";
import {
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function loadEnv() {
  const file = path.join(process.cwd(), ".env");
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*"(.*)"\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

async function main() {
  loadEnv();
  const endpoint = process.env.R2_ENDPOINT!;
  const bucket = process.env.R2_BUCKET!;
  const publicUrl = process.env.R2_PUBLIC_URL!;
  const client = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  await client.send(new HeadBucketCommand({ Bucket: bucket }));
  const key = `_health/r2-check-${Date.now()}.txt`;
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(`ok ${new Date().toISOString()}`),
      ContentType: "text/plain",
    }),
  );
  console.log("R2 OK");
  console.log("bucket:", bucket);
  console.log("url:", `${publicUrl.replace(/\/$/, "")}/${key}`);
}

main().catch((err) => {
  console.error("R2 FAIL");
  console.error(err?.message || err);
  process.exit(1);
});
