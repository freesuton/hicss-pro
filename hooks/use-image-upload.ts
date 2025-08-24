import { useState } from 'react';
import { uploadFilesToS3 } from '@/lib/utils';
import { compressAndResizeImage } from '@/lib/image-compress';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface UseImageUploadOptions {
  maxFiles?: number;
  onSuccess?: (urls: string[]) => void;
  onError?: (error: Error) => void;
}

export enum UploadImageType {
  Default = "default",
  Profile = "profile",
}

export const useImageUpload = (options: UseImageUploadOptions = {}) => {
  const { maxFiles = 9, onSuccess, onError } = options;
  const { user, token } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const uploadImages = async (
    files: FileList | File[],
    opts?: { imageType?: UploadImageType }
  ): Promise<string[]> => {
    console.log('user', user);
    console.log('token',token);
    console.log('opts', opts);
    if (!user || !user.id || !token) {
      toast.error('You must be logged in to upload images.');
      throw new Error('User not authenticated');
    }

    const fileArray = Array.from(files).slice(0, maxFiles);
    
    // Check for max individual file size (10MB)
    const tooLarge = fileArray.find(file => file.size > 10 * 1024 * 1024);
    if (tooLarge) {
      toast.error(`File "${tooLarge.name}" exceeds the 10MB size limit.`);
      throw new Error('File size exceeds 10MB');
    }

    if (fileArray.length === 0) {
      return [];
    }

    setIsUploading(true);
    
    // Show uploading toast
    const uploadToast = toast.loading(
      `Uploading ${fileArray.length} image${fileArray.length > 1 ? 's' : ''}...`
    );

    try {
      // Compress all images before upload
      const compressedFiles = await Promise.all(
        fileArray.map(async (file) => {
          const compressedFile = await compressAndResizeImage(
            file,
            opts?.imageType === UploadImageType.Profile ? { 
              maxWidth: 200, 
              maxHeight: 200,
              mimeType: 'image/png'
            } : undefined
          );
          
          // For profile images, ensure the file has .png extension
          if (opts?.imageType === UploadImageType.Profile) {
            const newFileName = file.name.replace(/\.[^/.]+$/, '.png');
            return new File([compressedFile], newFileName, { type: 'image/png' });
          }
          
          return compressedFile;
        })
      );
      const s3Urls = await uploadFilesToS3(
        compressedFiles,
        user.id,
        token,
        undefined,
        opts?.imageType
      );
      
      // Update toast to success
      toast.success(
        `Successfully uploaded ${fileArray.length} image${fileArray.length > 1 ? 's' : ''}!`,
        { id: uploadToast }
      );

      onSuccess?.(s3Urls);
      return s3Urls;
    } catch (error) {
      // Update toast to error
      toast.error('Failed to upload images. Please try again.', {
        id: uploadToast,
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onError?.(new Error(errorMessage));
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImages,
    isUploading,
    user,
  };
}; 