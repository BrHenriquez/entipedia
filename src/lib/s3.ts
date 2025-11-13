import { 
  S3Client, 
  DeleteObjectCommand, 
  PutObjectCommand, 
} from "@aws-sdk/client-s3";

const globalForS3 = globalThis as unknown as {
  s3Client?: S3Client;
};

// --- CLIENT INITIALIZATION ---

const getS3Region = () => {
  const region = process.env.AWS_REGION ?? process.env.S3_REGION;
  if (!region) {
    throw new Error("S3 configuration missing. Please set AWS_REGION or S3_REGION.");
  }
  return region;
};

const getS3BucketName = () => {
  const bucket = process.env.S3_BUCKET_NAME;
  if (!bucket) {
    throw new Error("S3 configuration missing. Please set S3_BUCKET_NAME.");
  }
  return bucket;
};

const createClient = () => {
  const clientConfig = {
    region: getS3Region(),
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
  const bucket = getS3BucketName();
  const region = getS3Region();

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        ACL: "public-read"
      })
    );
    
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    
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
  const bucket = getS3BucketName();

  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key
      })
    );
  } catch (error) {
    console.error("S3 Delete Error:", error);
  }
};