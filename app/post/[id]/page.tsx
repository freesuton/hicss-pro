"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  SquarePen,
  Trash2,
} from "lucide-react";
import BackButton from "@/components/BackButton";
import ProseMirrorContent from "@/components/ProseMirrorContent";
import { toDMS } from "@/components/map/utils";
import "./style.css";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { toast } from "sonner";

/* ---------- Types ---------- */
interface Post {
  id: string;
  title: string;
  name: string;
  userId: string;
  createdAt: string;
  readTime: string;
  coverMediaUrl?: string;
  tags: string[];
  summary?: string;
  content: string;
  location?: string;
  coordinate?: { type: string; coordinates: [number, number] };
}

/* ---------- Page ---------- */
export default function PostPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user, token } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [showCollections, setShowCollections] = useState(false);

  /* fetch post on mount / id change */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`/api/posts/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setPost(data.success ? data.data : null);
        }
      } catch (err: any) {
        if (!cancelled) setLoadError(err?.message || "Failed to load post");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Fetch collections if user is owner
  useEffect(() => {
    if (user && user.id && post?.userId && user.id === post.userId) {
      setCollectionsLoading(true);
      fetch(`/api/users/${user.id}/personal-page`)
        .then(res => res.json())
        .then(data => {
          if (data && data.collections) setCollections(data.collections);
        })
        .catch(() => setCollections([]))
        .finally(() => setCollectionsLoading(false));
    }
  }, [user, post?.userId]);

  const handleDelete = useCallback(async () => {
    if (!post) return;
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}` || ""
        }
      });
      if (res.status === 204) {
        router.push("/"); // change destination as needed
        return;
      }
      alert("Failed to delete post");
    } catch {
      alert("Error deleting post");
    } finally {
      setDeleting(false);
    }
  }, [post, router]);

  // Add to Collection handler
  const handleAddToCollection = async (collectionId: string) => {
    if (!post) return;
    try {
      const res = await fetch(`/api/collections/add-posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ collectionId, postIds: [post.id] }),
      });
      if (res.ok) {
        toast.success("Added to collection!");
        setShowCollections(false);
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to add to collection");
      }
    } catch (err) {
      toast.error("Failed to add to collection");
    }
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 text-center text-gray-500">
        Loading…
      </div>
    );
  }

  /* ---------- Not found / error ---------- */
  if (loadError || !post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 text-center">
        <BackButton />
        <p className="mt-4 text-gray-500">
          {loadError ? `Error: ${loadError}` : "Post not found."}
        </p>
      </div>
    );
  }

  /* ---------- Main view ---------- */
  return (
    <div className="mx-auto h-[calc(100vh-var(--tt-navbar-height))] max-w-2xl px-4 py-6">
      {/* Author */}
      <div className="mb-4 flex items-center gap-3">
        <BackButton />
        <img
          src="/placeholder-user.jpg"
          alt="avatar"
          className="h-10 w-10 rounded-full"
        />
        <div>
          <span className="font-bold">{post.name}</span>
          <span className="ml-2 font-mono text-xs text-gray-500">
            @{post.userId}
          </span>
        </div>
      </div>

      {/* Title + Edit/Delete */}
      <div className="mb-2 ml-2 flex items-center justify-between">
        <h1 className="text-lg font-bold">{post.title}</h1>
        {user?.id === post.userId && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center rounded bg-red-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              aria-label="Delete post"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <Link
              href={`/post/${post.id}/edit`}
              aria-label="Edit post"
              className="ml-0 flex items-center rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <SquarePen className="h-4 w-4" />
            </Link>
            <Popover open={showCollections} onOpenChange={setShowCollections}>
              <PopoverTrigger asChild>
                <button
                  className="ml-0 flex items-center rounded bg-green-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-green-700"
                  aria-label="Add to Collection"
                  type="button"
                >
                  + Add to Collection
                </button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-56">
                <div className="max-h-60 overflow-y-auto">
                  {collectionsLoading ? (
                    <div className="p-3 text-gray-500 text-sm">Loading…</div>
                  ) : collections.length === 0 ? (
                    <div className="p-3 text-gray-500 text-sm">No collections found.</div>
                  ) : (
                    <ul>
                      {collections.map((col: any) => (
                        <li key={col.id}>
                          <button
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                            onClick={() => handleAddToCollection(col.id)}
                          >
                            {col.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* Location + Date */}
      <div className="mb-4 flex flex-wrap items-center gap-4 text-gray-500">
        <span className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {post.location ?? "Location"}
          {post.coordinate?.coordinates?.length === 2 && (
            <span className="ml-2 font-mono text-xs">
              {toDMS(post.coordinate.coordinates[1], true)}{" "}
              {toDMS(post.coordinate.coordinates[0], false)}
            </span>
          )}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {post.createdAt}
        </span>
      </div>

      {/* Cover Thumbnail */}
      {post.coverMediaUrl && (
        <div className="mb-4 flex justify-center">
          <img
            src={post.coverMediaUrl}
            alt="cover thumbnail"
            className="h-28 w-28 rounded-xl border border-gray-200 object-cover shadow-md"
          />
        </div>
      )}

      {/* Separator */}
      <div className="my-6 w-full border-t border-gray-200" />

      {/* Content */}
      <ProseMirrorContent content={post.content} />
    </div>
  );
}