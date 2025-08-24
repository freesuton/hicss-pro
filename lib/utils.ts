// import { useAuth } from "@/contexts/AuthContext";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Uploads files to S3 using a presigned URL API endpoint.
 * @param files Array of File objects to upload
 * @param userId The user ID to use as the folder name
 * @param endpoint The API endpoint to request presigned URLs (default: '/api/s3/presigned-urls')
 * @returns Promise<string[]> Array of S3 file URLs
 */
export async function uploadFilesToS3(
  files: File[],
  userId: string,
  token: string,
  endpoint = '/api/s3/presigned-urls',
  imageType?: string
): Promise<string[]> {
  // const { token } = useAuth();
  console.log("token", token)
  if (!userId) throw new Error('User ID is required for S3 upload');
  if (!files.length) return [];

  // 1. Request presigned URLs from your backend
  const presignedRes = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',
      "Authorization": `Bearer ${token}` || ""
     },
    body: JSON.stringify({
      // userId: userId,
      files: files.map(file => ({
        fileName: file.name,
        fileType: file.type,
        userId: userId,
        imageType, // pass imageType to backend
      })),

    }),
  });
  const { data }: { data: { uploadUrl: string; fileUrl: string }[] } = await presignedRes.json();

  if (!data || data.length !== files.length) {
    throw new Error('Failed to get presigned URLs for all files.');
  }

  // 2. Upload each file to S3 using the presigned URLs
  await Promise.all(
    files.map((file, i) =>
      fetch(data[i].uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })
    )
  );

  // 3. Return the S3 file URLs
  return data.map(item => item.fileUrl);
}
