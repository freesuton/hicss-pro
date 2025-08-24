import React, { useRef } from "react";
import type { Editor } from "@tiptap/react";
import { useImageUpload } from "@/hooks/use-image-upload";
// --- Icons ---
import { ImagePlus } from "lucide-react";

export interface MediaUploadButtonProps {
  editor: Editor | null;
  max?: number;
  text?: string;
  className?: string;
}

export const MediaUploadButton: React.FC<MediaUploadButtonProps> = ({ 
  editor, 
  max = 9, 
  text = "Add",
  className = ""
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadImages, isUploading } = useImageUpload({
    maxFiles: max,
    onSuccess: (s3Urls) => {
      if (editor) {
        const s3Url = s3Urls[0];
        // let filename = "unknown";
        // if (s3Url) {
        //   // Extract the filename (without extension) from the S3 URL
        //   const match = s3Url.match(/([^/]+)(?=\.[^/.]+$)/);
        //   const uniquePart = match ? match[1] : "unknown";
        //   filename = `Nenki-${uniquePart}`;
        // }
        // Insert individual image nodes for each uploaded image
        const nodes = s3Urls.map(src => ({
          type: 'image',
          attrs: { src, alt: 'Nenki', title: 'Nenki'}
        }));
        editor.chain().focus().insertContent(nodes).run();
      }
    },
  });

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      await uploadImages(files);
      e.target.value = ""; // Reset input
    } catch (error) {
      // Error is already handled by the hook
      e.target.value = ""; // Reset input even on error
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Upload multiple images"
        onClick={handleClick}
        disabled={isUploading}
        className={className}
        style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          background: 'none',
          border: 'none',
          color: '#444', // inherit or muted gray
          fontSize: '14px',
          fontWeight: 400,
          padding: '6px',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          opacity: isUploading ? 0.6 : 1,
          boxShadow: 'none',
          borderRadius: 0,
        }}
      >
        <ImagePlus size={16} strokeWidth={2} />
        {isUploading ? 'Uploading...' : text}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={handleChange}
        disabled={isUploading}
      />
    </>
  );
};

export default MediaUploadButton; 