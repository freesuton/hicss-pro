"use client"
export const dynamic = 'force-dynamic';

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useState, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from '@/components/ui/button';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext";
import { useDebounced } from "@/hooks/use-debounced";


export default function NewPostPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [title, setTitle] = useState<string>("");
  const [initialContent, setInitialContent] = useState<any>(null);
  const [content, setContent] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);
  const [coordinate, setCoordinate] = useState<any>(null);
  const [coverMediaUrl, setCoverMediaUrl] = useState<string | null>(null);
  
  const [postId, setPostId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const { user, token } = useAuth();
  console.log("user", user);

  // On mount, check for lat/lng in query params
  useEffect(() => {
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const locationParam = searchParams.get("location");
    
    if (lat && lng) {
      setCoordinate({ type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] });
    }
    
    if (locationParam) {
      setLocation(decodeURIComponent(locationParam));
    }
  }, [searchParams]);

  // Draft data for debounced saving
  const draftData = {
    title,
    content,
    location,
    coordinate,
    userId: user?.id
  };

  const handleCreatePost = async () => {
    // title can not be empty
    if (!title) {
      toast.error("Title can not be empty");
      return;
    }
    // content can not be empty
    if (!user) return;
    
    setCreating(true);

    let finalCoverMediaUrl = coverMediaUrl;
    if (!finalCoverMediaUrl) {
      finalCoverMediaUrl = getFirstImageUrlFromContent(content);
    }
    console.log("finalCoverMediaUrl", finalCoverMediaUrl);


    try {
      const res = await fetch(`/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` || ""
        },
        body: JSON.stringify({
          title: title,
          content: content,
          location: location,
          coordinate: coordinate,
          coverMediaUrl: finalCoverMediaUrl || undefined
        }),
      });
      console.log("res", res);
      const responseData = await res.json();
      if (res.ok) {
        toast.success("Post created successfully");
        router.push(`/post/${responseData.data.id}`);
      } else {
        toast.error("Failed to create post");
        // console.error("Failed to save draft");
      }
    } catch (err) {
      console.error("Failed to create post:", err);
      toast.error("Error creating post");
    } finally {
      setCreating(false);
    }
  }

  // Handlers for editor changes
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleContentChange = (newContent: any) => {
    setContent(newContent);
  };

  return (
    <div className="h-screen">
      <div className="flex items-center justify-between mt-2 mb-1 mx-3 xl:mx-[16rem] 2xl:mx-[20rem]">
        <div onClick={() => router.push("/")} className="flex items-center gap-2 font-bold text-2xl">
          Nenki
        </div>
        <div className="flex items-center gap-3">
          {/* Draft saving indicator */}
          {/* <div className="text-sm text-gray-500 flex items-center gap-2">
            {isSaving ? (
              <>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              </>
            ) : null}
          </div> */}

          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white rounded-full px-2 py-1 text-sm leading-tight font-medium transition h-auto"
            onClick={handleCreatePost}
            disabled={creating}
          >
            {creating ? "Creating..." : "Submit"}
          </Button>
        </div>
      </div>
      <SimpleEditor
        initialTitle={title}
        initialContent={initialContent}
        onTitleChange={handleTitleChange}
        onContentChange={handleContentChange}
        coverImage={coverMediaUrl}
        onCoverImageChange={setCoverMediaUrl}
        location={location}
        onLocationChange={setLocation}
        initialCoordinate={coordinate}
        onCoordinateChange={setCoordinate}
      />
    </div>
  )
}

function getFirstImageUrlFromContent(content: any): string | null {
  if (!content) return null;
  // Recursively search for image or gallery nodes
  const findImage = (node: any): string | null => {
    if (!node) return null;
    if (node.type === "image" && node.attrs?.src) return node.attrs.src;
    if (node.type === "gallery" && Array.isArray(node.attrs?.images) && node.attrs.images.length > 0) {
      // images is an array of URLs (strings)
      return node.attrs.images[0] || null;
    }
    if (node.content && Array.isArray(node.content)) {
      for (const child of node.content) {
        const found = findImage(child);
        if (found) return found;
      }
    }
    return null;
  };
  return findImage(content);
}
