import {
  isBufferPngImage,
  isUploadedFilePngImage,
  MAX_CHARACTER_PNG_FILE_SIZE_BYTES,
} from "~/server/character-png-validation";
import {
  isAttackDefendShadingValue,
  type AttackDefendShadingValue,
} from "~/lib/attack-defend-shading";

export const MAX_CHARACTER_NAME_LENGTH = 120;

export type ParsedCharacterName =
  | { isValid: true; trimmedCharacterName: string }
  | { isValid: false; errorMessage: string };

export function parseCharacterNameFieldValue(
  nameFieldValue: FormDataEntryValue | null,
): ParsedCharacterName {
  if (typeof nameFieldValue !== "string") {
    return { isValid: false, errorMessage: "Character name is required." };
  }
  const trimmedCharacterName = nameFieldValue.trim();
  if (trimmedCharacterName.length === 0) {
    return { isValid: false, errorMessage: "Character name is required." };
  }
  if (trimmedCharacterName.length > MAX_CHARACTER_NAME_LENGTH) {
    return {
      isValid: false,
      errorMessage: `Character name must be ${MAX_CHARACTER_NAME_LENGTH} characters or fewer.`,
    };
  }
  return { isValid: true, trimmedCharacterName };
}

export type ParsedCharacterPngUpload =
  | { isValid: true; uploadedPngFile: File; fileBuffer: Buffer }
  | { isValid: false; errorMessage: string };

export async function parseCharacterPngFileFieldValue(
  fileFieldValue: FormDataEntryValue | null,
): Promise<ParsedCharacterPngUpload> {
  if (!(fileFieldValue instanceof File)) {
    return { isValid: false, errorMessage: "PNG file is required." };
  }

  const uploadedPngFile = fileFieldValue;
  if (isUploadedFilePngImage(uploadedPngFile) === false) {
    return { isValid: false, errorMessage: "File must be a PNG image." };
  }
  if (uploadedPngFile.size > MAX_CHARACTER_PNG_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      errorMessage: "PNG file must be 5 MB or smaller.",
    };
  }

  const fileArrayBuffer = await uploadedPngFile.arrayBuffer();
  const fileBuffer = Buffer.from(fileArrayBuffer);
  if (isBufferPngImage(fileBuffer) === false) {
    return { isValid: false, errorMessage: "File must be a PNG image." };
  }

  return { isValid: true, uploadedPngFile, fileBuffer };
}

export type ParsedOptionalCharacterPngUpload =
  | { isValid: true; hasFile: false }
  | { isValid: true; hasFile: true; uploadedPngFile: File; fileBuffer: Buffer }
  | { isValid: false; errorMessage: string };

export async function parseOptionalCharacterPngFileFieldValue(
  fileFieldValue: FormDataEntryValue | null,
): Promise<ParsedOptionalCharacterPngUpload> {
  if (fileFieldValue === null) {
    return { isValid: true, hasFile: false };
  }
  if (typeof fileFieldValue === "string" && fileFieldValue.length === 0) {
    return { isValid: true, hasFile: false };
  }

  const parsedRequiredPngUpload = await parseCharacterPngFileFieldValue(
    fileFieldValue,
  );
  if (parsedRequiredPngUpload.isValid === false) {
    return parsedRequiredPngUpload;
  }

  return {
    isValid: true,
    hasFile: true,
    uploadedPngFile: parsedRequiredPngUpload.uploadedPngFile,
    fileBuffer: parsedRequiredPngUpload.fileBuffer,
  };
}

export type ParsedAttackDefendShading =
  | { isValid: true; shading: AttackDefendShadingValue }
  | { isValid: false; errorMessage: string };

export function parseAttackDefendShadingFieldValue(
  shadingFieldValue: FormDataEntryValue | null,
): ParsedAttackDefendShading {
  if (typeof shadingFieldValue !== "string") {
    return { isValid: false, errorMessage: "Shading is required." };
  }
  if (isAttackDefendShadingValue(shadingFieldValue) === false) {
    return { isValid: false, errorMessage: "Shading must be A, B, or C." };
  }
  return { isValid: true, shading: shadingFieldValue };
}
