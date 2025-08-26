"use client"

import { useEffect, useMemo, useState } from "react"
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

type ApiProject = {
  id: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
  owner: { id: string; name: string | null; image: string | null }
  tags: { tag: { slug: string; name: string } }[]
  assets: { id: string; kind: string; fileKey: string; fileName: string; mime: string; sizeBytes: number; url?: string | null }[]
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<ApiProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch(`/api/projects/${params.id}`)
        if (!res.ok) throw new Error("Failed to load project")
        const data = (await res.json()) as ApiProject
        if (mounted) setProject(data)
      } catch (e) {
        console.error(e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [params.id])

  const tagNames = useMemo(() => project?.tags?.map((t) => t.tag.name) ?? [], [project])
  const modelAsset = useMemo(() => project?.assets?.find((a) => a.kind === "MODEL"), [project])
  const files = project?.assets ?? []

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      await fetch(`/api/projects/${params.id}/download`, { method: "POST" })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h1 className="text-3xl font-bold">{loading ? "Loading..." : project?.title ?? "Project"}</h1>
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
          {tagNames.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center mb-6">
          <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
            <Image
              src={"/placeholder.svg"}
              alt={project?.owner?.name || "Owner"}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-medium">{project?.owner?.name || "Unknown"}</p>
            <p className="text-sm text-gray-500">
              Created: {project?.createdAt?.slice(0,10) || "-"} • Updated: {project?.updatedAt?.slice(0,10) || "-"}
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
                    <ModelViewer url={modelAsset?.url || undefined} />
                    <OrbitControls />
                  </Canvas>
                </div>
                <p className="text-gray-600">{project?.description}</p>
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
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                          {file.mime.includes("python") && <Code className="h-5 w-5 text-purple-500 mr-3" />}
                          {file.mime.includes("gltf") || file.mime.includes("glb") ? (
                            <Package className="h-5 w-5 text-blue-500 mr-3" />
                          ) : (
                            <FileText className="h-5 w-5 text-gray-500 mr-3" />
                          )}
                        <div>
                            <p className="font-medium">{file.fileName}</p>
                            <p className="text-xs text-gray-500">{(file.sizeBytes / 1024).toFixed(1)} KB</p>
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
                  <p className="text-gray-600">No instructions provided yet.</p>
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
