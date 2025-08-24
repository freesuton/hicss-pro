"use client"

import { useEffect, useState, useRef } from "react";
import { Search, Bookmark, Heart, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"

interface Post {
  id: string;
  coverMediaUrl?: string;
  title: string;
  user: {
    id: string;
    avatarUrl?: string;
    name: string;
  };
  likes?: number;
  comments?: number;
}

export default function ExplorePage() {
  const categories = ["All", "Fashion", "Interior", "Travel", "Food", "Art", "Nature"]
  const [data, setData] = useState<{ posts: Post[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/posts/page?page=1&limit=10");
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const json = await res.json();
        console.log("json", json);
        setData(json.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch posts.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // 🔧 Inline CroppedImage logic
  // Max aspect ratio is 1:2 - 2:1
  const CroppedImage = ({ src, alt }: { src: string; alt: string }) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const [ratioClass, setRatioClass] = useState("h-full object-cover");

    useEffect(() => {
      const img = imgRef.current;
      if (!img) return;

      const handleLoad = () => {
        const { naturalWidth, naturalHeight } = img;
        if (naturalWidth / naturalHeight >= 2) {
          setRatioClass("aspect-[2/1] object-cover object-center");
        } else if (naturalHeight / naturalWidth >= 2) {
          setRatioClass("aspect-[1/2] object-cover object-center");
        } else {
          setRatioClass("h-full object-cover");
        }
      };

      if (img.complete) {
        handleLoad();
      } else {
        img.addEventListener("load", handleLoad);
        return () => img.removeEventListener("load", handleLoad);
      }
    }, [src]);

    return (
      <div className="relative w-full">
        <img ref={imgRef} src={src} alt={alt} className={`w-full ${ratioClass}`} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-30 p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input className="pl-10 pr-4 py-2 rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-blue-200" placeholder="Search posts, users, or tags..." />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Button key={cat} variant="outline" className="rounded-full px-4 py-1 text-sm whitespace-nowrap">
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Masonry Posts Grid */}
      <div className="columns-2 lg:columns-3 xl:columns-4 gap-2 p-6">
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {data && data.posts.map((post) => (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="mb-4 break-inside-avoid bg-white rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {/* 🌄 Adaptive Cover Image */}
            {post.coverMediaUrl ? (
              <CroppedImage
                src={post.coverMediaUrl}
                alt={post.title}
              />
            ) : (
              <div
                className="w-full aspect-[5/3] flex items-center justify-center bg-gradient-to-br from-cyan-100 to-purple-100"
                style={{ minHeight: 120 }}
              >
                <span className="text-2xl font-semibold text-gray-600 text-center px-2 break-words">
                  {post.title || "Untitled placemark"}
                </span>
              </div>
            )}

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1 line-clamp-2">{post.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Image src={post.user.avatarUrl || "/placeholder-user.jpg"} alt={post.user.name} width={24} height={24} className="rounded-full" />
                  <span>{post.user.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{post.likes || 0}</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />{post.comments || 0}</span>
                <Bookmark className="w-4 h-4 ml-auto cursor-pointer" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}