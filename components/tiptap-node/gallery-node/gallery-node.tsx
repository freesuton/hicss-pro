'use client'

import React, { useRef, useState } from 'react'
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import './gallery-node.scss'
import { useImageUpload } from '@/hooks/use-image-upload'

export const Gallery = Node.create({
  name: 'gallery',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      images: {
        default: [],
        parseHTML: element => {
          const data = element.getAttribute('data-images')
          const arr = data ? JSON.parse(data) : []
          return arr.slice(0, 6) // Only allow up to 6 images
        },
        renderHTML: attributes => ({
          'data-images': JSON.stringify((attributes.images || []).slice(0, 6)),
        }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="gallery"]' }]
  },

  renderHTML({ HTMLAttributes, node }) {
    const images: string[] = (node.attrs.images || []).slice(0, 6);
    return [
      'div',
      mergeAttributes(
        {
          ...HTMLAttributes,
          // class: 'tiptap-gallery',
          'data-type': 'gallery',
          'data-image-count': images.length,
        }
      ),
      ...images.map((src: string) => ['img', { src }])
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(GalleryComponent)
  },
})

const GalleryComponent = (props: any) => {
  // Only render up to 6 images
  const images = (props.node.attrs.images as string[]).slice(0, 6)
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  const { uploadImages, isUploading } = useImageUpload({
    maxFiles: 6 - images.length,
    onSuccess: (s3Urls) => {
      props.updateAttributes({
        images: [...images, ...s3Urls].slice(0, 6),
      });
    },
  });

  // Check if the node is selected
  const isSelected = props.selected;

  // Handle add button click
  const handleAddClick = () => {
    if (images.length < 6 && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Add some visual feedback
    e.dataTransfer.setData('text/plain', '');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder the images array
    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    
    // Remove the dragged image from its original position
    newImages.splice(draggedIndex, 1);
    
    // Insert it at the new position
    newImages.splice(dropIndex, 0, draggedImage);

    // Update the node attributes
    props.updateAttributes({
      images: newImages,
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <>
      <NodeViewWrapper 
        className={`tiptap-gallery-wrapper ${isSelected ? 'selected' : ''}`}
        tabIndex={0}
      >
        {/* Add Button - only show when selected and can add more images */}
        {isSelected && images.length < 6 && (
          <div className="gallery-add-button-container">
            <button
              className="gallery-add-button"
              onClick={handleAddClick}
              disabled={isUploading}
            >
              {isUploading ? (
                <div className="loading-spinner">⏳</div>
              ) : (
                <>
                  <span className="add-icon">+</span>
                  <span className="add-text">Add Images</span>
                </>
              )}
            </button>
          </div>
        )}
        
        <div 
          className={`tiptap-gallery tiptap-gallery-in-editor`}
          data-image-count={images.length}
        >
          {images.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className={`gallery-image-container ${draggedIndex === index ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <img
                src={src}
                alt={`Image ${index + 1}`}
                style={{ 
                  cursor: "grab",
                  pointerEvents: "none", // Prevent image from interfering with drag
                }}
                onMouseDown={(e) => e.preventDefault()} // Prevent text selection
              />
            </div>
          ))}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={handleFileChange}
          disabled={images.length >= 6 || isUploading}
        />
      </NodeViewWrapper>
    </>
  )
}