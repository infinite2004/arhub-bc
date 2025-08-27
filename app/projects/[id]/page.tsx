import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Download, Calendar, User } from "lucide-react"
import ModelViewer from "@/components/model-viewer"
import DownloadButton from "@/components/download-button"
import Link from "next/link"

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      owner: { select: { name: true, email: true } },
      tags: { include: { tag: true } },
      assets: true,
      downloads: true,
    },
  })

  if (!project) {
    notFound()
  }

  const modelAssets = project.assets.filter(asset => asset.kind === "MODEL")
  const scriptAssets = project.assets.filter(asset => asset.kind === "SCRIPT")
  const configAssets = project.assets.filter(asset => asset.kind === "CONFIG")

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
            <p className="text-xl text-gray-600 mb-4">{project.description}</p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center">
                <User className="mr-1 h-4 w-4" />
                {project.owner?.name || project.owner?.email || "Unknown"}
              </div>
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                {new Date(project.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Eye className="mr-1 h-4 w-4" />
                {project.downloads.length} downloads
              </div>
            </div>
          </div>
          <DownloadButton projectId={project.id} />
        </div>

        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Badge key={tag.tag.id} variant="outline">
                {tag.tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 3D Model Viewer */}
        {modelAssets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>3D Model Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ModelViewer fileKey={modelAssets[0].fileKey} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Project Files */}
        <Card>
          <CardHeader>
            <CardTitle>Project Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {modelAssets.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">3D Models ({modelAssets.length})</h3>
                <div className="space-y-2">
                  {modelAssets.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{asset.fileName}</span>
                      <span className="text-xs text-gray-500">
                        {(asset.sizeBytes / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {scriptAssets.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Scripts ({scriptAssets.length})</h3>
                <div className="space-y-2">
                  {scriptAssets.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{asset.fileName}</span>
                      <span className="text-xs text-gray-500">
                        {(asset.sizeBytes / 1024).toFixed(2)} KB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {configAssets.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Configuration ({configAssets.length})</h3>
                <div className="space-y-2">
                  {configAssets.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{asset.fileName}</span>
                      <span className="text-xs text-gray-500">
                        {(asset.sizeBytes / 1024).toFixed(2)} KB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">
                Total: {project.assets.length} files,{" "}
                {(project.assets.reduce((sum, asset) => sum + asset.sizeBytes, 0) / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Details */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">About this Project</h3>
              <p className="text-gray-600">{project.description}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Project Information</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Visibility:</dt>
                  <dd>
                    <Badge variant={project.visibility === "PUBLIC" ? "default" : "secondary"}>
                      {project.visibility}
                    </Badge>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Created:</dt>
                  <dd>{new Date(project.createdAt).toLocaleDateString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Updated:</dt>
                  <dd>{new Date(project.updatedAt).toLocaleDateString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Downloads:</dt>
                  <dd>{project.downloads.length}</dd>
                </div>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
