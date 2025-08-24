import Compressor from 'compressorjs';

/**
 * Compress and resize an image file for upload using Compressor.js.
 * @param file The image file to compress.
 * @param options Optional compression options.
 * @returns A Promise<File> of the compressed image.
 */
export function compressAndResizeImage(
  file: File,
  options?: {
    quality?: number; // 0-1, default 0.8
    maxWidth?: number;
    maxHeight?: number;
    convertSize?: number; // in bytes, default 5MB
    mimeType?: string;
  }
): Promise<File> {
  // Calculate quality based on file size
  const TWO_MB = 2 * 1024 * 1024;
  const FIVE_MB = 5 * 1024 * 1024;
  let calculatedQuality = 0.8;

  if (file.size > FIVE_MB) {
    calculatedQuality = 0.4; // Very aggressive compression for very large files
  } else if (file.size > TWO_MB) {
    calculatedQuality = 0.6; // More aggressive compression for large files
  }

  const {
    quality = calculatedQuality,
    maxWidth = 1080,
    maxHeight = 1080,
    convertSize = 5 * 1080 * 1080,
    mimeType,
  } = options || {};

  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality,
      maxWidth,
      maxHeight,
      convertSize,
      mimeType,
      success(result) {
        resolve(result as File);
      },
      error(err) {
        reject(err);
      },
    });
  });
} 