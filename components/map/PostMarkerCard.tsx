import React from "react";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  coverMediaUrl?: string | null;
  // Add other post properties as needed
}

interface PostMarkerCardProps {
  post: Post;
  onClose: () => void;
}

const PostMarkerCard: React.FC<PostMarkerCardProps> = ({ post, onClose }) => {
  return (
    <Link href={`/post/${post.id}`} onClick={onClose}>
      <div
        className="fixed z-50 bg-white/95 shadow-lg rounded-xl p-2 w-screen md:w-96 md:max-w-md transition-all border-b border-gray-200 cursor-pointer hover:shadow-xl"
        style={{
          right: '1rem',
          top: '78px',
          left: 'auto',
          bottom: 'auto',
          // On mobile, stick to bottom above navbar (navbar is 100px)
          ...(window.innerWidth < 768 ? { top: 'auto', bottom: '52px', left: 0, right: 0, borderRadius: '1rem 1rem 0 0', width: '100vw' } : {}),
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between mb-1">
          <div className="font-semibold text-lg truncate flex-1" title={post.title}>{post.title}</div>
          <button 
            className="text-gray-500 hover:text-gray-700 ml-2" 
            onClick={(e) => {
              e.preventDefault(); // Prevent Link navigation
              e.stopPropagation(); // Prevent card click
              onClose();
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Cover image or title placeholder */}
        <div className="mb-1 w-full flex justify-center">
          {post.coverMediaUrl ? (
            <img
              src={post.coverMediaUrl}
              alt="cover"
              className="rounded-lg object-cover max-h-48 w-full"
              style={{ maxHeight: 192 }}
            />
          ) : (
            <div
              className="w-full h-48 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #d1f3ff 0%, #f3eaff 100%)"
              }}
            >
              <span className="text-3xl font-semibold text-gray-700 text-center px-2 break-words">
                {post.title}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PostMarkerCard; 