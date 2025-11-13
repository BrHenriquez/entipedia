import { 
  S3Client, 
  DeleteObjectCommand, 
  PutObjectCommand, 
} from "@aws-sdk/client-s3";

const S3_REGION = process.env.AWS_REGION ?? process.env.S3_REGION; 
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

if (!S3_REGION) {
  throw new Error("S3 configuration missing. Please set AWS_REGION or S3_REGION.");
}

if (!S3_BUCKET_NAME) {
  throw new Error("S3 configuration missing. Please set S3_BUCKET_NAME.");
}

const globalForS3 = globalThis as unknown as {
  s3Client?: S3Client;
};

// --- CLIENT INITIALIZATION ---

const createClient = () => {
  const clientConfig = {
    region: S3_REGION,
  };

  return new S3Client(clientConfig);
}

export const getS3Client = () => {
  if (!globalForS3.s3Client) {
    globalForS3.s3Client = createClient();
  }
  return globalForS3.s3Client;
}

type UploadParams = {
  key: string;
  body: Buffer | Uint8Array | Blob | string;
  contentType: string;
};

/**
 * Uploads a file to the configured S3 bucket.
 * @param key - The key of the file to upload.
 * @param body - The body of the file to upload.
 * @param contentType - The content type of the file to upload.
 * @returns The URL of the uploaded file.
 * @throws An error if the file upload fails.
 */
export const uploadFileToS3 = async ({ key, body, contentType }: UploadParams) => {
  const client = getS3Client();

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: contentType,
        ACL: "public-read"
      })
    );
    
    return `https://${S3_BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com/${key}`;
    
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw error;
  }
}

/**
 * Deletes a file from the configured S3 bucket.
 * @param key - The key of the file to delete.
 */
export const deleteFileFromS3 = async (key: string) => {
  const client = getS3Client();

  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key
      })
    );
  } catch (error) {
    console.error("S3 Delete Error:", error);
  }
};