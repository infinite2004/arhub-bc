import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, ThumbsUp, Search, Filter } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Mock data for projects
const projects = [
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
  {
    id: 4,
    title: "AR Navigation System",
    description: "Indoor navigation system using AR markers",
    author: "NavTech",
    downloads: 432,
    views: 1250,
    likes: 156,
    tags: ["Navigation", "AR Markers", "Indoor"],
    image: "/placeholder.svg?height=200&width=350",
  },
  {
    id: 5,
    title: "AR Educational Tool",
    description: "Educational AR application for learning anatomy",
    author: "EduCreator",
    downloads: 987,
    views: 2340,
    likes: 278,
    tags: ["Education", "Anatomy", "Learning"],
    image: "/placeholder.svg?height=200&width=350",
  },
  {
    id: 6,
    title: "AR Product Visualization",
    description: "Visualize products in AR before purchasing",
    author: "ShopTech",
    downloads: 765,
    views: 1890,
    likes: 210,
    tags: ["E-commerce", "Product Visualization", "Shopping"],
    image: "/placeholder.svg?height=200&width=350",
  },
]

export default function ProjectsPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">AR Projects</h1>
        <Link href="/upload">
          <Button>Upload Project</Button>
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Search projects..." className="pl-10" />
          </div>
          <Button variant="outline" className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="popular">Most Popular</TabsTrigger>
          <TabsTrigger value="recent">Recently Added</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link href={`/projects/${project.id}`} key={project.id}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={project.image || "/placeholder.svg"}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
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
        </TabsContent>
        <TabsContent value="featured" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 3).map((project) => (
              <Link href={`/projects/${project.id}`} key={project.id}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={project.image || "/placeholder.svg"}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
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
        </TabsContent>
        <TabsContent value="popular" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...projects]
              .sort((a, b) => b.downloads - a.downloads)
              .slice(0, 3)
              .map((project) => (
                <Link href={`/projects/${project.id}`} key={project.id}>
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                      <Image
                        src={project.image || "/placeholder.svg"}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
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
        </TabsContent>
        <TabsContent value="recent" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(3, 6).map((project) => (
              <Link href={`/projects/${project.id}`} key={project.id}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={project.image || "/placeholder.svg"}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
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
        </TabsContent>
      </Tabs>
    </main>
  )
}
