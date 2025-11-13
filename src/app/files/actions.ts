"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db, files } from "@/db";
import { deleteFileFromS3, uploadFileToS3 } from "@/lib/s3";

const ensureBucket = () => {
  const bucket = process.env.S3_BUCKET_NAME;
  if (!bucket) {
    throw new Error("S3_BUCKET_NAME is not defined in the environment variables.");
  }
  return bucket;
}

export async function uploadFileAction(formData: FormData) {
  const file = formData.get("file") as File | null;
  const description = (formData.get("description") as string) ?? "";

  console.log("file", file);

  if (!file) {
    throw new Error("You must select a file.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const extension = file.name.split(".").pop() ?? "";
  const mimeType = file.type ?? "application/octet-stream";
  const bucket = ensureBucket();
  const key = `uploads/${randomUUID()}-${file.name}`;

  const url = await uploadFileToS3({
    key,
    body: buffer,
    contentType: mimeType,
  });

  await db.insert(files).values({
    name: file.name,
    description: description ?? null,
    mimeType,
    extension,
    size: (file.size / 1024 / 1024).toFixed(2),
    s3Bucket: bucket,
    s3Key: key,
    url
  });

  revalidatePath("/files");
}

export async function deleteFileAction(id: string) {
  const [existing] = await db
    .select()
    .from(files)
    .where(eq(files.id, id))
    .limit(1);

  if (!existing) {
    throw new Error("File not found.");
  }

  await deleteFileFromS3(existing.s3Key);
  await db.delete(files).where(eq(files.id, id));

  revalidatePath("/files");
}

export async function getDownloadUrlAction(id: string) {
  const [file] = await db
    .select()
    .from(files)
    .where(eq(files.id, id))
    .limit(1);

  if (!file) {
    throw new Error("File not found.");
  }

  return file;
}

