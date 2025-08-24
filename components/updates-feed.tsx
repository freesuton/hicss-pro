import { PostCard } from "./post-card";

const mockPosts = [
  {
    user: {
      name: 'Sarah Chen',
      avatar: '/placeholder.svg?height=40&width=40',
      fallback: 'SC',
      time: '2h',
    },
    caption: 'Perfect morning in paradise',
    emojis: '🌺',
    likes: '1.2k',
    comments: '89',
    imagePlaceholder: 'bg-gradient-to-br from-pink-300 to-red-300'
  },
  {
    user: {
      name: 'Alex Rivera',
      avatar: '/placeholder.svg?height=40&width=40',
      fallback: 'AR',
      time: '4h',
    },
    caption: 'Sunrise hike was worth every step',
    emojis: '⛰️',
    likes: '856',
    comments: '42',
    imagePlaceholder: 'bg-gradient-to-br from-yellow-300 to-orange-300'
  },
    {
    user: {
      name: 'John Doe',
      avatar: '/placeholder.svg?height=40&width=40',
      fallback: 'JD',
      time: '1d',
    },
    caption: 'Exploring the city streets',
    emojis: '🏙️',
    likes: '432',
    comments: '12',
    imagePlaceholder: 'bg-gradient-to-br from-blue-300 to-indigo-300'
  },
  {
    user: {
      name: 'Jane Smith',
      avatar: '/placeholder.svg?height=40&width=40',
      fallback: 'JS',
      time: '2d',
    },
    caption: 'A day at the beach',
    emojis: '🌊',
    likes: '987',
    comments: '56',
    imagePlaceholder: 'bg-gradient-to-br from-cyan-300 to-teal-300'
  }
];

export function UpdatesFeed() {
  return (
    <div className="grid grid-cols-2 gap-1">
      {mockPosts.map((post, index) => (
        <PostCard key={index} {...post} />
      ))}
    </div>
  )
}
