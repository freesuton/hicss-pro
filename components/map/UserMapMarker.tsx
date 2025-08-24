import React from 'react';

export default function UserMapMarker({ src }: { src: string }) {
  return (
    <div className="w-10 h-10 bg-white rounded-full border-2 border-white shadow-md overflow-hidden flex items-center justify-center">
      <img src={src} alt="marker" className="w-full h-full object-cover" />
    </div>
  );
} 