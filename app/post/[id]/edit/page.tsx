"use client"
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from '@/components/ui/button';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext";

export default function App() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState<string>("");
  const [initialContent, setInitialContent] = useState<any>(null);
  const [content, setContent] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);
  const [coordinate, setCoordinate] = useState<any>(null);
  const [coverMediaUrl, setCoverMediaUrl] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const { token } = useAuth();
  
  useEffect(() => {
    if (!id) return;
    const fetchContent = async () => {
      try {
        const res = await fetch(`/api/posts/${id}`);
        const responseData = await res.json();
        const data = responseData.data;
        if (responseData.success) {
          console.log("content in post page", data)
          console.log("title in post page", data.title)
          setTitle(data.title);
          // setContent(data.content);
          setInitialContent(data.content);
          setContent(data.content);
          if (data.coverMediaUrl) setCoverMediaUrl(data.coverMediaUrl);
          if (data.location) setLocation(data.location);
          if (data.coordinate) setCoordinate(data.coordinate);
        } else {
          console.error('Failed to fetch content:', responseData.message);
          router.push("/404");
        }
      } catch (err) {
        console.error("Error fetching content:", err);
      }
    };
    fetchContent();
  }, [id]);

  const handleUpdatePost = async () => {
    setUpdating(true);
    // title can not be empty
    if (!title) {
      toast.error("Title can not be empty");
      setUpdating(false);
      return;
    }
    let finalCoverMediaUrl = coverMediaUrl;
    if (!finalCoverMediaUrl) {
      finalCoverMediaUrl = getFirstImageUrlFromContent(content);
    }
    console.log("finalCoverMediaUrl", finalCoverMediaUrl);


    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` || ""
        },
        body: JSON.stringify({ title, content, location, coordinate, coverMediaUrl: finalCoverMediaUrl }),
      });

      console.log("Post updated successfully:", response);
      if (response.ok) {
        toast.success("Post updated successfully");
        router.push(`/post/${id}`);
      } else {
        toast.error("Failed to update post");
      }
      // Optionally, you might want to redirect to the updated post page
    } catch (err) {
      console.error("Error updating post:", err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="h-screen">
      <div className="flex items-center justify-between my-1 mr-3 xl:mx-[16rem] 2xl:mx-[20rem]">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Back {title}
        </Button>
        <Button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white rounded-full px-2 py-1 text-sm leading-tight font-medium transition h-auto"
          onClick={handleUpdatePost}
          disabled={updating}
        >
          {updating ? "Updating..." : "Submit"}
        </Button>
      </div>
      <SimpleEditor
        initialTitle={title}
        initialContent={initialContent}
        onTitleChange={setTitle}
        onContentChange={setContent}
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