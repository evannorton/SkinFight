import "server-only";

import { env } from "~/env";

export type BackblazeEnvConfig = {
  applicationKeyId: string;
  applicationKey: string;
  bucketName: string;
  s3Endpoint: string;
  s3Region: string;
  publicFileUrlPrefix: string;
};

export function getBackblazeEnvConfig(): BackblazeEnvConfig | null {
  if (
    typeof env.B2_APPLICATION_KEY_ID === "undefined" ||
    typeof env.B2_APPLICATION_KEY === "undefined" ||
    typeof env.B2_BUCKET_NAME === "undefined" ||
    typeof env.B2_S3_ENDPOINT === "undefined" ||
    typeof env.B2_S3_REGION === "undefined" ||
    typeof env.B2_PUBLIC_FILE_URL_PREFIX === "undefined"
  ) {
    return null;
  }

  return {
    applicationKeyId: env.B2_APPLICATION_KEY_ID,
    applicationKey: env.B2_APPLICATION_KEY,
    bucketName: env.B2_BUCKET_NAME,
    s3Endpoint: env.B2_S3_ENDPOINT,
    s3Region: env.B2_S3_REGION,
    publicFileUrlPrefix: env.B2_PUBLIC_FILE_URL_PREFIX,
  };
}
