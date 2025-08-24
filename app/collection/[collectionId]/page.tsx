"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, MessageCircle, Bookmark, Trash2 } from "lucide-react";
import Image from "next/image";

interface Post {
  id: string;
  title: string;
  coverMediaUrl: string | null;
  createdAt: string;
  collection?: {
    name: string;
    description: string | null;
  };
  user: {
    id: string;
    avatarUrl?: string;
    name: string;
  };
  likes?: number;
  comments?: number;
}

interface Collection {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export default function CollectionPage() {
  const params = useParams();
  const router = useRouter();
  const { token, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 🔧 Inline CroppedImage logic from explore page
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

  const handleDeleteCollection = async () => {
    if (!collection || !token) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/collections/${collection.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete collection');
      }

      // Navigate back to previous page or home
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete collection");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both collection details and posts
        const [collectionRes, postsRes] = await Promise.all([
          fetch(`/api/collections/${params.collectionId}`, {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }),
          fetch(`/api/posts/posts-in-collection/${params.collectionId}`, {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          })
        ]);

        if (!collectionRes.ok || !postsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [collectionData, postsData] = await Promise.all([
          collectionRes.json(),
          postsRes.json()
        ]);

        setCollection(collectionData);
        setPosts(postsData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.collectionId) {
      fetchData();
    }
  }, [params.collectionId, token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="columns-2 lg:columns-3 xl:columns-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="mb-4 break-inside-avoid bg-gray-200 rounded-xl aspect-[5/3]"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const collectionName = collection?.name || "Collection";
  const collectionDescription = collection?.description;
  const isOwner = user && collection && user.id === collection.userId;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="p-2 hover:bg-gray-100 rounded-full"
                asChild
              >
                <Link href="javascript:history.back()">
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">{collectionName}</h1>
            </div>
            
            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Collection
              </Button>
            )}
          </div>
          {collectionDescription && (
            <p className="text-gray-600 ml-12">{collectionDescription}</p>
          )}
        </div>

        {/* Masonry Posts Grid */}
        <div className="columns-2 lg:columns-3 xl:columns-4 gap-4">
          {posts.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-400">
              No posts yet.
            </div>
          ) : (
            posts.map((post) => (
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
                      <Image 
                        src={post.user?.avatarUrl || "/placeholder-user.jpg"} 
                        alt={post.user?.name || "User"} 
                        width={24} 
                        height={24} 
                        className="rounded-full" 
                      />
                      <span>{post.user?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{post.likes || 0}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />{post.comments || 0}</span>
                    <Bookmark className="w-4 h-4 ml-auto cursor-pointer" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Collection
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{collectionName}"? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteCollection}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 