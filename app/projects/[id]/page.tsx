"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Eye, ThumbsUp, Share2, Code, FileText, Package } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import ModelViewer from "@/components/model-viewer"

// Mock project data
const project = {
  id: 1,
  title: "Face Tracking AR Mask",
  description:
    "A face tracking AR mask using OpenCV and 3D models. This project demonstrates how to create an augmented reality face mask that tracks facial movements in real-time.",
  longDescription:
    "This project uses OpenCV for face detection and tracking, combined with 3D models to create an interactive AR face mask. The system tracks facial landmarks in real-time and maps them to the 3D model, allowing for realistic movement and expressions. The project includes both the tracking scripts and the 3D models, making it easy to customize and extend.",
  author: "ARDeveloper",
  authorAvatar: "/placeholder.svg?height=50&width=50",
  downloads: 1245,
  views: 3890,
  likes: 342,
  dateCreated: "2023-05-15",
  lastUpdated: "2023-11-22",
  tags: ["Face Tracking", "3D Model", "OpenCV", "AR", "Facial Recognition"],
  image: "/placeholder.svg?height=400&width=700",
  files: [
    { name: "face_tracking.py", type: "script", size: "45 KB" },
    { name: "mask_model.obj", type: "3d", size: "2.3 MB" },
    { name: "textures.zip", type: "archive", size: "4.7 MB" },
    { name: "README.md", type: "document", size: "12 KB" },
    { name: "requirements.txt", type: "document", size: "1 KB" },
  ],
  requirements: ["Python 3.8+", "OpenCV 4.5+", "NumPy", "PyTorch (optional for enhanced tracking)"],
  instructions: [
    "Download the project bundle",
    "Install dependencies using pip install -r requirements.txt",
    "Run python face_tracking.py to start the application",
    "Press 'q' to quit the application",
  ],
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = () => {
    setIsDownloading(true)
    // Simulate download
    setTimeout(() => {
      setIsDownloading(false)
    }, 2000)
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button onClick={handleDownload} disabled={isDownloading}>
              {isDownloading ? "Downloading..." : "Download Project"}
              <Download className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center mb-6">
          <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
            <Image
              src={project.authorAvatar || "/placeholder.svg"}
              alt={project.author}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-medium">{project.author}</p>
            <p className="text-sm text-gray-500">
              Created: {project.dateCreated} • Updated: {project.lastUpdated}
            </p>
          </div>
        </div>

        <div className="flex gap-6 text-sm text-gray-600 mb-8">
          <div className="flex items-center">
            <Download className="h-4 w-4 mr-1" />
            {project.downloads} downloads
          </div>
          <div className="flex items-center">
            <Eye className="h-4 w-4 mr-1" />
            {project.views} views
          </div>
          <div className="flex items-center">
            <ThumbsUp className="h-4 w-4 mr-1" />
            {project.likes} likes
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="preview">
            <TabsList className="mb-6">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="mt-0">
              <div className="bg-gray-100 rounded-lg overflow-hidden h-[400px] mb-6">
                <Canvas>
                  <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} />
                  <ModelViewer />
                  <OrbitControls />
                </Canvas>
              </div>
              <p className="text-gray-600">{project.description}</p>
            </TabsContent>

            <TabsContent value="description" className="mt-0">
              <div className="prose max-w-none">
                <p className="mb-4">{project.longDescription}</p>
                <h3 className="text-xl font-semibold mb-2">System Requirements</h3>
                <ul className="list-disc pl-5 mb-4">
                  {project.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
                <h3 className="text-xl font-semibold mb-2">Features</h3>
                <ul className="list-disc pl-5">
                  <li>Real-time face tracking using OpenCV</li>
                  <li>3D model overlay with accurate positioning</li>
                  <li>Customizable textures and models</li>
                  <li>Optimized for performance on standard hardware</li>
                  <li>Detailed documentation and examples</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="files" className="mt-0">
              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-lg font-semibold mb-4">Project Files</h3>
                <div className="space-y-3">
                  {project.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        {file.type === "script" && <Code className="h-5 w-5 text-purple-500 mr-3" />}
                        {file.type === "3d" && <Package className="h-5 w-5 text-blue-500 mr-3" />}
                        {file.type === "archive" && <Package className="h-5 w-5 text-green-500 mr-3" />}
                        {file.type === "document" && <FileText className="h-5 w-5 text-gray-500 mr-3" />}
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500">{file.size}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="instructions" className="mt-0">
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-4">How to Use This Project</h3>
                <ol className="list-decimal pl-5 mb-6">
                  {project.instructions.map((instruction, index) => (
                    <li key={index} className="mb-2">
                      {instruction}
                    </li>
                  ))}
                </ol>
                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="text-lg font-semibold mb-2 text-blue-800">Tips for Best Results</h4>
                  <ul className="list-disc pl-5 text-blue-800">
                    <li>Use in well-lit environments for better tracking</li>
                    <li>For best performance, use a camera with at least 720p resolution</li>
                    <li>Adjust the parameters in the config.json file to fine-tune tracking sensitivity</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Project Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">License</p>
                  <p>MIT License</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Version</p>
                  <p>1.2.0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Python Version</p>
                  <p>3.8+</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Dependencies</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline">OpenCV 4.5+</Badge>
                    <Badge variant="outline">NumPy</Badge>
                    <Badge variant="outline">PyTorch</Badge>
                  </div>
                </div>
              </div>

              <div className="border-t my-6"></div>

              <h3 className="text-lg font-semibold mb-4">Related Projects</h3>
              <div className="space-y-4">
                <Link href="/projects/2" className="block">
                  <div className="flex gap-3">
                    <div className="relative h-16 w-16 flex-shrink-0 rounded overflow-hidden">
                      <Image
                        src="/placeholder.svg?height=64&width=64"
                        alt="Related project"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">AR Object Recognition</h4>
                      <p className="text-sm text-gray-600">Recognize objects in real-time</p>
                    </div>
                  </div>
                </Link>
                <Link href="/projects/3" className="block">
                  <div className="flex gap-3">
                    <div className="relative h-16 w-16 flex-shrink-0 rounded overflow-hidden">
                      <Image
                        src="/placeholder.svg?height=64&width=64"
                        alt="Related project"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">Interactive AR Environment</h4>
                      <p className="text-sm text-gray-600">Create interactive AR environments</p>
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
