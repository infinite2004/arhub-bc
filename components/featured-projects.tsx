import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, ThumbsUp } from "lucide-react"

// Mock data for featured projects
const featuredProjects = [
  {
    id: 1,
    title: "Face Tracking AR Mask",
    description: "A face tracking AR mask using OpenCV and 3D models",
    author: "ARDeveloper",
    downloads: 1245,
    views: 3890,
    likes: 342,
    tags: ["Face Tracking", "3D Model", "OpenCV"],
    image: "/placeholder.svg?height=200&width=350",
  },
  {
    id: 2,
    title: "AR Object Recognition",
    description: "Recognize objects in real-time and overlay information",
    author: "TechCreator",
    downloads: 876,
    views: 2150,
    likes: 189,
    tags: ["Object Recognition", "Information Overlay", "OpenCV"],
    image: "/placeholder.svg?height=200&width=350",
  },
  {
    id: 3,
    title: "Interactive AR Environment",
    description: "Create interactive AR environments with gesture controls",
    author: "ARInnovator",
    downloads: 654,
    views: 1780,
    likes: 231,
    tags: ["Gesture Control", "Environment", "Interactive"],
    image: "/placeholder.svg?height=200&width=350",
  },
]

export default function FeaturedProjects() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuredProjects.map((project) => (
        <Link href={`/projects/${project.id}`} key={project.id}>
          <Card className="h-full hover:shadow-lg transition-shadow duration-300">
            <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
              <Image src={project.image || "/placeholder.svg"} alt={project.title} fill className="object-cover" />
            </div>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
              <p className="text-gray-600 mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-500">By {project.author}</p>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <Download className="h-4 w-4 mr-1" />
                {project.downloads}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Eye className="h-4 w-4 mr-1" />
                {project.views}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <ThumbsUp className="h-4 w-4 mr-1" />
                {project.likes}
              </div>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}
