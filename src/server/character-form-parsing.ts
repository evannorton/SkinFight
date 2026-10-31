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
export const MAX_DESCRIPTION_LENGTH = 1000;
export const MAX_EXTERNAL_SKIN_URL_LENGTH = 2048;

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

  const parsedRequiredPngUpload =
    await parseCharacterPngFileFieldValue(fileFieldValue);
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

export type ParsedOptionalThemeId =
  | { isValid: true; themeId: string | null }
  | { isValid: false; errorMessage: string };

export function parseOptionalThemeIdFieldValue(
  themeIdFieldValue: FormDataEntryValue | null,
): ParsedOptionalThemeId {
  if (themeIdFieldValue === null) {
    return { isValid: true, themeId: null };
  }
  if (typeof themeIdFieldValue === "string" && themeIdFieldValue.length === 0) {
    return { isValid: true, themeId: null };
  }
  if (typeof themeIdFieldValue !== "string") {
    return { isValid: false, errorMessage: "Invalid theme selection." };
  }
  return { isValid: true, themeId: themeIdFieldValue };
}

export type ParsedOptionalDescription =
  | { isValid: true; description: string | null }
  | { isValid: false; errorMessage: string };

export function parseOptionalDescriptionFieldValue(
  descriptionFieldValue: FormDataEntryValue | null,
): ParsedOptionalDescription {
  if (descriptionFieldValue === null) {
    return { isValid: true, description: null };
  }
  if (typeof descriptionFieldValue !== "string") {
    return { isValid: false, errorMessage: "Invalid description." };
  }
  const trimmedDescription = descriptionFieldValue.trim();
  if (trimmedDescription.length === 0) {
    return { isValid: true, description: null };
  }
  if (trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
    return {
      isValid: false,
      errorMessage: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`,
    };
  }
  return { isValid: true, description: trimmedDescription };
}

export type ParsedOptionalExternalSkinUrl =
  | { isValid: true; externalSkinUrl: string | null }
  | { isValid: false; errorMessage: string };

function isHttpOrHttpsExternalSkinUrl(externalSkinUrl: string): boolean {
  try {
    const parsedExternalSkinUrl = new URL(externalSkinUrl);
    if (parsedExternalSkinUrl.protocol === "http:") {
      return true;
    }
    if (parsedExternalSkinUrl.protocol === "https:") {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function parseOptionalExternalSkinUrlFieldValue(
  externalSkinUrlFieldValue: FormDataEntryValue | null,
): ParsedOptionalExternalSkinUrl {
  if (externalSkinUrlFieldValue === null) {
    return { isValid: true, externalSkinUrl: null };
  }
  if (typeof externalSkinUrlFieldValue !== "string") {
    return { isValid: false, errorMessage: "Invalid external skin URL." };
  }
  const trimmedExternalSkinUrl = externalSkinUrlFieldValue.trim();
  if (trimmedExternalSkinUrl.length === 0) {
    return { isValid: true, externalSkinUrl: null };
  }
  if (trimmedExternalSkinUrl.length > MAX_EXTERNAL_SKIN_URL_LENGTH) {
    return {
      isValid: false,
      errorMessage: `External skin URL must be ${MAX_EXTERNAL_SKIN_URL_LENGTH} characters or fewer.`,
    };
  }
  if (isHttpOrHttpsExternalSkinUrl(trimmedExternalSkinUrl) === false) {
    return {
      isValid: false,
      errorMessage: "External skin URL must be a valid http or https URL.",
    };
  }
  return { isValid: true, externalSkinUrl: trimmedExternalSkinUrl };
}
