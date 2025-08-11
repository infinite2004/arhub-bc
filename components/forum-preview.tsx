import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { MessageCircle, Eye } from "lucide-react"

// Mock forum data
const forumPosts = [
  {
    id: 1,
    title: "Best practices for face tracking in low-light conditions",
    author: "ARDeveloper",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    category: "Face Tracking",
    replies: 24,
    views: 342,
    lastActivity: "2 hours ago",
    isHot: true,
  },
  {
    id: 2,
    title: "How to optimize 3D model rendering for mobile devices?",
    author: "TechCreator",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    category: "3D Models",
    replies: 18,
    views: 256,
    lastActivity: "5 hours ago",
    isHot: false,
  },
  {
    id: 3,
    title: "Implementing SLAM with OpenCV - Tutorial and Code",
    author: "ARInnovator",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    category: "SLAM",
    replies: 32,
    views: 512,
    lastActivity: "1 day ago",
    isHot: true,
  },
  {
    id: 4,
    title: "AR Hub Python Runner installation issues on macOS",
    author: "NewDeveloper",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    category: "Python Runner",
    replies: 12,
    views: 178,
    lastActivity: "2 days ago",
    isHot: false,
  },
  {
    id: 5,
    title: "Announcing AR Hub Community Hackathon - Join Now!",
    author: "AdminUser",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    category: "Announcements",
    replies: 45,
    views: 890,
    lastActivity: "3 days ago",
    isHot: true,
  },
]

export default function ForumPreview() {
  return (
    <div className="space-y-4">
      {forumPosts.map((post) => (
        <Link href={`/community/forums/post/${post.id}`} key={post.id}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10 hidden sm:block">
                  <AvatarImage src={post.authorAvatar || "/placeholder.svg"} alt={post.author} />
                  <AvatarFallback>{post.author.substring(0, 2)}</AvatarFallback>
                </Avatar>

                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="bg-gray-100">
                      {post.category}
                    </Badge>
                    {post.isHot && <Badge className="bg-red-500">Hot</Badge>}
                  </div>

                  <h3 className="font-semibold text-lg mb-1">{post.title}</h3>

                  <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-4 gap-y-1">
                    <span>By {post.author}</span>
                    <div className="flex items-center">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      {post.replies} replies
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {post.views} views
                    </div>
                    <span>Last activity: {post.lastActivity}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
