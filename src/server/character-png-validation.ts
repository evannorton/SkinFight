const PNG_SIGNATURE_BYTES: readonly number[] = [
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
];

export const MAX_CHARACTER_PNG_FILE_SIZE_BYTES: number = 5 * 1024 * 1024;

export function isBufferPngImage(fileBuffer: Buffer): boolean {
  if (fileBuffer.length < PNG_SIGNATURE_BYTES.length) {
    return false;
  }
  for (
    let signatureByteIndex = 0;
    signatureByteIndex < PNG_SIGNATURE_BYTES.length;
    signatureByteIndex += 1
  ) {
    const expectedByte = PNG_SIGNATURE_BYTES[signatureByteIndex];
    if (expectedByte === undefined) {
      return false;
    }
    if (fileBuffer[signatureByteIndex] !== expectedByte) {
      return false;
    }
  }
  return true;
}

export function isUploadedFilePngImage(uploadedFile: File): boolean {
  const normalizedFileName = uploadedFile.name.toLowerCase();
  const hasPngFileExtension = normalizedFileName.endsWith(".png");
  const hasPngMimeType = uploadedFile.type === "image/png";
  return hasPngFileExtension === true || hasPngMimeType === true;
}
