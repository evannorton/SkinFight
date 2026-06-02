import "server-only";

import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { getBackblazeEnvConfig } from "~/server/backblaze-env";

let backblazeS3Client: S3Client | undefined;

const CHARACTER_OBJECT_KEY_PREFIX = "characters/";
const ATTACK_OBJECT_KEY_PREFIX = "attacks/";
const DEFEND_OBJECT_KEY_PREFIX = "defends/";

function getBackblazeS3Client(): S3Client {
  const backblazeEnvConfig = getBackblazeEnvConfig();
  if (backblazeEnvConfig === null) {
    throw new Error("Backblaze B2 is not configured.");
  }

  if (typeof backblazeS3Client === "undefined") {
    backblazeS3Client = new S3Client({
      endpoint: backblazeEnvConfig.s3Endpoint,
      region: backblazeEnvConfig.s3Region,
      credentials: {
        accessKeyId: backblazeEnvConfig.applicationKeyId,
        secretAccessKey: backblazeEnvConfig.applicationKey,
      },
      forcePathStyle: true,
    });
  }
  return backblazeS3Client;
}

export function buildPublicFileUrlFromObjectKey(objectKey: string): string {
  const backblazeEnvConfig = getBackblazeEnvConfig();
  if (backblazeEnvConfig === null) {
    throw new Error("Backblaze B2 is not configured.");
  }
  return `${backblazeEnvConfig.publicFileUrlPrefix}/${objectKey}`;
}

export async function uploadPngToBackblaze(params: {
  objectKey: string;
  fileBody: Buffer;
}): Promise<string> {
  const backblazeEnvConfig = getBackblazeEnvConfig();
  if (backblazeEnvConfig === null) {
    throw new Error("Backblaze B2 is not configured.");
  }

  const s3Client = getBackblazeS3Client();
  await s3Client.send(
    new PutObjectCommand({
      Bucket: backblazeEnvConfig.bucketName,
      Key: params.objectKey,
      Body: params.fileBody,
      ContentType: "image/png",
    }),
  );
  return buildPublicFileUrlFromObjectKey(params.objectKey);
}

export async function uploadCharacterPngToBackblaze(params: {
  objectKey: string;
  fileBody: Buffer;
}): Promise<string> {
  if (isManagedCharacterBackblazeObjectKey(params.objectKey) === false) {
    throw new Error("Refusing to upload to a non-character object key.");
  }
  return uploadPngToBackblaze(params);
}

export function extractBackblazeObjectKeyFromPublicFileUrl(
  publicFileUrl: string,
): string | null {
  const backblazeEnvConfig = getBackblazeEnvConfig();
  if (backblazeEnvConfig === null) {
    return null;
  }

  const publicFileUrlPrefixWithSlash = `${backblazeEnvConfig.publicFileUrlPrefix}/`;
  if (publicFileUrl.startsWith(publicFileUrlPrefixWithSlash) === false) {
    return null;
  }

  const objectKey = publicFileUrl.slice(publicFileUrlPrefixWithSlash.length);
  if (objectKey.length === 0) {
    return null;
  }
  return objectKey;
}

export function isManagedCharacterBackblazeObjectKey(objectKey: string): boolean {
  return objectKey.startsWith(CHARACTER_OBJECT_KEY_PREFIX);
}

export function isManagedAttackBackblazeObjectKey(objectKey: string): boolean {
  return objectKey.startsWith(ATTACK_OBJECT_KEY_PREFIX);
}

export function isManagedDefendBackblazeObjectKey(objectKey: string): boolean {
  return objectKey.startsWith(DEFEND_OBJECT_KEY_PREFIX);
}

function assertManagedBackblazeObjectKeyCanBeDeleted(objectKey: string): void {
  const isManagedObjectKey =
    isManagedCharacterBackblazeObjectKey(objectKey) === true ||
    isManagedAttackBackblazeObjectKey(objectKey) === true ||
    isManagedDefendBackblazeObjectKey(objectKey) === true;
  if (isManagedObjectKey === false) {
    throw new Error("Refusing to delete an unmanaged object key.");
  }
}

export async function deletePngFromBackblaze(objectKey: string): Promise<void> {
  assertManagedBackblazeObjectKeyCanBeDeleted(objectKey);

  const backblazeEnvConfig = getBackblazeEnvConfig();
  if (backblazeEnvConfig === null) {
    throw new Error("Backblaze B2 is not configured.");
  }

  const s3Client = getBackblazeS3Client();
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: backblazeEnvConfig.bucketName,
      Key: objectKey,
    }),
  );
}

export async function deletePngFromBackblazeByPublicFileUrl(
  publicFileUrl: string,
): Promise<void> {
  const objectKey = extractBackblazeObjectKeyFromPublicFileUrl(publicFileUrl);
  if (objectKey === null) {
    throw new Error("Could not resolve Backblaze object key from public file URL.");
  }
  await deletePngFromBackblaze(objectKey);
}

export async function deleteCharacterPngFromBackblaze(
  objectKey: string,
): Promise<void> {
  if (isManagedCharacterBackblazeObjectKey(objectKey) === false) {
    throw new Error("Refusing to delete a non-character object key.");
  }
  await deletePngFromBackblaze(objectKey);
}

export async function deleteCharacterPngFromBackblazeByPublicFileUrl(
  publicFileUrl: string,
): Promise<void> {
  await deletePngFromBackblazeByPublicFileUrl(publicFileUrl);
}
