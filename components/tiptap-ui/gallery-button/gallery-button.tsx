import React, { useRef } from "react";
import type { Editor } from "@tiptap/react";
import { useImageUpload } from "@/hooks/use-image-upload";
import { LayoutPanelLeft } from "lucide-react";
import { toast } from 'sonner';

export interface GalleryButtonProps {
  editor: Editor | null;
  max?: number;
}

export const GalleryButton: React.FC<GalleryButtonProps> = ({ editor, max = 9 }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadImages, isUploading } = useImageUpload({
    maxFiles: max,
    onSuccess: (s3Urls) => {
      if (editor) {
        editor.chain().focus().insertContent({
          type: 'gallery',
          attrs: { images: s3Urls },
        }).run();
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

    if (files.length < 2) {
      toast.error('Please select at least 2 images for a gallery.');
      e.target.value = ""; // Reset input
      return;
    }

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
        onClick={handleClick} 
        disabled={isUploading}
        style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '1px',
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
        <LayoutPanelLeft size={16} strokeWidth={2} />
        {isUploading ? 'Uploading...' : 'Gallery'}
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

export default GalleryButton;

