import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Bookmark } from "lucide-react"

type PostCardProps = {
  user: {
    name: string
    avatar: string
    fallback: string
    time: string
  }
  caption: string
  likes: string
  comments: string
  imagePlaceholder: string
  emojis?: string
}

export function PostCard({ user, caption, likes, comments, imagePlaceholder, emojis }: PostCardProps) {
  return (
    <Card className="rounded-2xl shadow-lg border-0 bg-white overflow-hidden group">
      <div className="relative">
        <div className={`w-full aspect-[4/3] bg-gray-200 flex items-center justify-center ${imagePlaceholder}`}>
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </div>
        <div className="absolute top-4 right-4 bg-white/70 backdrop-blur-sm p-2 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
          <Bookmark className="w-5 h-5 text-gray-700" />
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center mb-3">
          <Avatar className="w-10 h-10 border-2 border-white shadow-md">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.fallback}</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <h4 className="font-semibold text-gray-900">{user.name}</h4>
            <p className="text-sm text-gray-500">{user.time}</p>
          </div>
          <div className="ml-auto text-gray-500 cursor-pointer">
             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
          </div>
        </div>
        <p className="text-gray-800 mb-3">{caption} {emojis && <span>{emojis}</span>}</p>
        <div className="flex items-center gap-4 text-gray-500">
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-red-500 transition-colors">
            <Heart className="w-5 h-5" />
            <span className="font-medium text-sm">{likes}</span>
          </div>
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-blue-500 transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium text-sm">{comments}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
