import React, { useState } from "react";
import "./gallery-node.scss";

export function GalleryView({ images }: { images: string[] }) {
  const [modalImage, setModalImage] = useState<string | null>(null);
  const count = images.length;

  return (
    <>
      <div className="tiptap-gallery" data-image-count={count}>
        {images.map((src, idx) => (
          <div
            key={idx}
            className="gallery-image-container"
          >
            <img
              src={src}
              alt={`Image ${idx + 1}`}
              style={{ objectFit: "cover", borderRadius: 6, aspectRatio: "1", cursor: "pointer" }}
              onClick={() => setModalImage(src)}
            />
          </div>
        ))}
      </div>
      {modalImage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setModalImage(null)}
        >
          <img
            src={modalImage}
            alt="Full size"
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              boxShadow: "0 0 24px #000",
              background: "#fff",
              borderRadius: 8,
            }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
} 