"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Calendar, LinkIcon, Mail, Phone, Edit, MessageCircle, UserPlus, TrendingUp, DollarSign, Package, Ellipsis, Menu, Share2, LogOut } from "lucide-react"
import dynamic from "next/dynamic"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { useRef, useEffect, useState } from "react"
import ProtectedRoute from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useImageUpload, UploadImageType } from "@/hooks/use-image-upload";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { useRouter } from "next/navigation";

const Mapbox = dynamic(() => import("@/components/map/Mapbox"), {
  ssr: false,
  loading: () => <div className="w-full h-96 rounded-lg bg-gray-200 animate-pulse" />,
})

type Post = {
  id: string;
  title: string;
  coverMediaUrl: string;
  location?: string; // for the name
  coordinate?: { type: string, coordinates: [number, number] }; // for the map
};

function ProfilePageContent() {
  const AWS_S3_BUCKET_ROOT_URL = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_ROOT_URL;
    const { user, logout, token, isLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const pageUserId = params?.userId as string;
    const avatarUrl = `${AWS_S3_BUCKET_ROOT_URL}/user-uploads/${pageUserId}/profile_image.png`;


  const footprintsRef = useRef<HTMLDivElement>(null)
  const investRef = useRef<HTMLDivElement>(null)

  const [userInfo, setUserInfo] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editProfile, setEditProfile] = useState("");
  const [editImage, setEditImage] = useState<string | undefined>(avatarUrl);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { uploadImages, isUploading } = useImageUpload({
    maxFiles: 1,
    onSuccess: (urls) => {
      if (urls[0]) {
        setEditImage(urls[0] || undefined);
        console.log("editImage", editImage);
      }
    },
  });

  const [showAddCollectionModal, setShowAddCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [addingCollection, setAddingCollection] = useState(false);

  // Handle image file change and upload to S3
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // set local image path
    // if (file) {
    //   setEditImage(URL.createObjectURL(file));
    // }
    if (file) {
    
      try {
        const urls = await uploadImages([file], { imageType: UploadImageType.Profile });
        if (urls[0]) {

          setEditImage(urls[0] || undefined);
          
          console.log("editImage", editImage);
        }
      } catch (err) {
    
      }
    }
  };

  const handleAddCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !newCollectionName) return;
    setAddingCollection(true);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userId: user.id,
          name: newCollectionName,
          description: newCollectionDescription,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create collection');
      }
      const result = await res.json();
      setCollections((prev) => [result, ...prev]);
      toast.success("Collection created!");
      setShowAddCollectionModal(false);
      setNewCollectionName("");
      setNewCollectionDescription("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create collection");
    } finally {
      setAddingCollection(false);
    }
  };


  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    if (isLoading) return; // Wait until auth state is loaded

    if (!pageUserId) return;
    const fetchPersonalPage = async () => {
      try {
        const res = await fetch(`/api/users/${pageUserId}/personal-page`);
        if (!res.ok) {
          // If this is the logged user's page and it's not found, redirect to auth
          if (user && user.id === pageUserId) {
            router.push("/auth");
            return;
          }
          setIsNotFound(true);
          return;
        }
        const data = await res.json();
        console.log("data", data);
        if (data) {
          setUserInfo(data);
          setEditId(data.id || "");
          setEditName(data.name || "");
          setEditProfile(data.profile || "");
          setPosts(data.posts || []);
          setEditImage(avatarUrl);
          if (data.collections && data.collections.length > 0) {
            setCollections(data.collections);
          } 
        } else {
          // If this is the logged user's page and no data, redirect to auth
          if (user && user.id === pageUserId) {
            router.push("/auth");
            return;
          }
          setIsNotFound(true);
        }
      } catch (err) {
        // If this is the logged user's page and there's an error, redirect to auth
        if (user && user.id === pageUserId) {
          router.push("/auth");
          return;
        }
        setIsNotFound(true);
      }
    };
    fetchPersonalPage();
  }, [user, isLoading, pageUserId, router]);

  if (isNotFound) {
    return <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-lg text-gray-500 mb-2">User Not Found</p>
      <p className="text-gray-400">The user you are looking for does not exist.</p>
    </div>;
  }

  const handleSaveProfile = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}` || ""
        },
        body: JSON.stringify({
          name: editName,
          profile: editProfile,
          avatarUrl: editImage,
        }),
      });
      if (res.ok) {
        toast.success('Profile updated!');
        setShowEditModal(false);
        // Optionally update user context/state here
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative mx-auto max-w-4xl bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col gap-4">
        {/* Menu Button at top right of header */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Open menu"
              className="absolute top-6 right-6 z-20 bg-white border border-gray-200 shadow-sm rounded-full p-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Menu className="h-6 w-6 text-gray-500" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-40 p-2">
            {user && (
              <Button variant="ghost" className="w-full justify-start" onClick={() => setShowEditModal(true)}>
                <Edit className="mr-2" /> Edit Profile
              </Button>
            )}
            <Button variant="ghost" className="w-full justify-start" onClick={() => {/* TODO: implement share logic */}}>
              <Share2 className="mr-2" /> Share
            </Button>
            {user && (
              <Button variant="ghost" className="w-full justify-start text-red-600" onClick={logout}>
                <LogOut className="mr-2" /> Log out
              </Button>
            )}
          </PopoverContent>
        </Popover>
        <div className="flex items-center gap-4">
          {/* Profile Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="w-24 h-24 border-4 border-white shadow-md">
              <AvatarImage
                src={
               
                    `${editImage }?t=${Date.now()}`
                }
                alt="Profile"
              />
              <AvatarFallback className="text-2xl font-semibold bg-gray-100 text-gray-400">
                Nenki
              </AvatarFallback>
            </Avatar>
          </div>
          {/* profile name, title , location  */}
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-gray-900 tracking-tight" style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>{userInfo?.name || ''}</h1>
            <p className="text-md text-gray-500 font-light ml-1" style={{ fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>@{userInfo?.id || ''}</p>
                   {/* Profile Info */}
        <div className="flex-1 min-w-0 mt-1">
          <div className="text-gray-600 text-base font-normal" style={{ fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
            {userInfo?.profile || ''}
          </div>
        </div>
            {/* <div className="flex flex-wrap gap-2 mt-1">
              <Badge
                variant="secondary"
                className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 text-sm font-medium px-3 py-1 rounded-full"
              >
                UI/UX Design
              </Badge>
              <Badge
                variant="secondary"
                className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 text-sm font-medium px-3 py-1 rounded-full"
              >
                Product Strategy
              </Badge>
              <Badge
                variant="secondary"
                className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 text-sm font-medium px-3 py-1 rounded-full"
              >
                Design Systems
              </Badge>
            </div> */}
          </div>
        </div>

      </div>

      {/* updates feed */}
      {/* Recent Posts Section */}
      <div className="mx-auto max-w-4xl px-2 pt-2 border-b-2 border-gray-200">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-gray-900 text-xl pb-1">Updates feed</h4>
          <button className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          {posts.length === 0 ? (
            <div className="text-gray-400 text-center py-8">No updates yet.</div>
          ) : (
            <div className="flex gap-4 pb-2" style={{ width: "max-content" }}>
              {posts.map((post) => (
                <Link key={post.id} href={`/post/${post.id}`} className="flex-shrink-0 w-36">
                  <div className="relative">
                    {post.coverMediaUrl ? (
                      <img
                        src={post.coverMediaUrl}
                        alt={post.title}
                        className="w-full h-32 object-cover rounded-xl shadow-sm"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gradient-to-br from-cyan-100 to-purple-100 rounded-xl shadow-sm flex items-center justify-center p-2">
                        <h3 className="text-gray-700 text-lg font-medium text-center leading-tight line-clamp-3 overflow-hidden">
                          {post.title}
                        </h3>
                      </div>
                    )}
                    {/* {true && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-white/90 text-gray-900 shadow-md font-semibold text-xs">
                          Guest favorite {post.location?.coordinates?.join(', ')}
                        </Badge>
                      </div>
                    )} */}
                  </div>
                  <div className=" ml-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-xs text-gray-900">{post.title}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content Tabs */}
      <div className="mx-auto max-w-4xl">

        {/* Collections Section */}
        <div className="w-full mt-2 px-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Collections</h2>
            <Button className="bg-gradient-to-br from-blue-500 to-blue-400 hover:bg-blue-700 text-white rounded-lg px-2 text-sm font-medium" onClick={() => setShowAddCollectionModal(true)}>
              + Add Collection
            </Button>
          </div>
          {collections.length === 0 ? (
            <div className="text-gray-400 text-center py-8">No collections yet.</div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-2">
              {collections.map((col) => (
                <Link 
                  key={col.id} 
                  href={`/collection/${col.id}`}
                  className="block transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="bg-white rounded-xl shadow p-1 flex flex-col border border-gray-100 hover:shadow-md transition-all duration-300">
                    <h3 className="font-semibold text-sm text-center">{col.name}</h3>
                    <div className="flex gap-1 overflow-x-auto">
                      {col.collectionPosts && col.collectionPosts.length > 0 ? (
                        col.collectionPosts.slice(0, 3).map((collectionPost: any) => (
                          collectionPost.post.coverMediaUrl ? (
                            <img
                              key={collectionPost.post.id}
                              src={collectionPost.post.coverMediaUrl}
                              alt={collectionPost.post.title}
                              className="w-16 h-16 object-cover rounded-lg border"
                            />
                          ) : (
                            <div key={collectionPost.post.id} className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-purple-100 rounded-lg border flex items-center justify-center p-1">
                              <p className="text-gray-700 text-[10px] font-medium text-center leading-tight line-clamp-3">
                                {collectionPost.post.title}
                              </p>
                            </div>
                          )
                        ))
                      ) : (
                        <div className="text-gray-400 text-sm">No posts</div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div defaultValue="about" className="w-full">


      
          {/* Footprints */}
          <div ref={footprintsRef}>
            <Link href="/profile/footprints" className="block mb-0 mt-2 p-2 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 ml-2">Footprints</h3>
              <div className="rounded-xl overflow-hidden h-[400px] w-full">
                <Mapbox
                  interactive={false}
                  rotateCamera={true}
                  posts={
                    posts
                      .filter(post => post.coordinate && Array.isArray(post.coordinate.coordinates))
                  }
                />
              </div>
            </Link>
          </div>
          {/* invest in this creator */}
          {/* <div ref={investRef} className="p-2">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="grid gap-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-900">Invest in this creator</h4>
                      <p className="text-sm text-gray-500">Get a share of their future earnings.</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0">Invest</Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-gray-600">Share Price</p>
                        <p className="font-bold text-lg text-gray-900">$1.25</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-gray-600">Market Cap</p>
                        <p className="font-bold text-lg text-gray-900">$1.2M</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-gray-600">24h Change</p>
                        <p className="font-bold text-lg text-green-600">+5.2%</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={[
                          { name: "Jan", value: 1.1 },
                          { name: "Feb", value: 1.15 },
                          { name: "Mar", value: 1.2 },
                          { name: "Apr", value: 1.18 },
                          { name: "May", value: 1.25 },
                          { name: "Jun", value: 1.3 },
                        ]}
                        margin={{ top: 5, right: 20, left: -10, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            border: "1px solid #e2e8f0",
                            borderRadius: "0.5rem",
                          }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#colorValue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div> */}

        </div>
      </div>

      {/* Add custom CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        /* Improve mobile scrolling performance */
        * {
          -webkit-overflow-scrolling: touch;
        }
        /* Optimize for mobile viewport */
        @media (max-width: 768px) {
          .min-h-screen {
            min-height: 100vh;
            min-height: -webkit-fill-available;
          }
        }
      `}</style>

      {/* Edit Profile Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form className="space-y-6">
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center gap-2">
              <label className="font-semibold text-gray-700 mb-1">Profile Image</label>
              <img
                src={
                  (editImage || user?.avatarUrl)
                    ? `${editImage || user?.avatarUrl}?t=${Date.now()}`
                    : undefined
                }
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover ring-2 ring-blue-200 shadow-lg transition-all duration-200"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-2 text-sm text-gray-500 file:rounded-full file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:font-semibold file:text-blue-700 hover:file:bg-blue-50"
                disabled={isUploading}
              />
            </div>
            {/* Name */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Name</label>
              <input
                className="w-full rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-300 border border-gray-200 shadow-sm text-gray-900 placeholder-gray-400 px-4 py-2 transition"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            {/* Profile (bio) */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Profile</label>
              <textarea
                className="w-full rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-300 border border-gray-200 shadow-sm text-gray-900 placeholder-gray-400 px-4 py-2 min-h-[80px] resize-none transition"
                value={editProfile}
                onChange={e => setEditProfile(e.target.value)}
                placeholder="Tell us more about yourself..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold shadow transition"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white font-semibold shadow transition"
                onClick={handleSaveProfile}
              >
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddCollectionModal} onOpenChange={setShowAddCollectionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Collection</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCollection} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
                value={newCollectionName}
                onChange={e => setNewCollectionName(e.target.value)}
                required
                placeholder="Collection name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
                value={newCollectionDescription}
                onChange={e => setNewCollectionDescription(e.target.value)}
                placeholder="Description (optional)"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowAddCollectionModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 text-white" disabled={addingCollection}>
                {addingCollection ? "Adding..." : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ProfilePage() {
  return (
    // <ProtectedRoute>
      <ProfilePageContent />
    // </ProtectedRoute>
  )
}
