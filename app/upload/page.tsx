"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { X, Upload, Plus, FileText, Package, Code } from "lucide-react"
import { UploadButton } from "@/lib/uploadthing"
import type { OurFileRouter } from "@/app/api/uploadthing/route"

export default function UploadPage() {
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [longDescription, setLongDescription] = useState("")
  const [uploaded, setUploaded] = useState<{ kind: string; key: string; name: string; type: string; size: number }[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          description, 
          tags, 
          assets: uploaded.map(u => ({
            kind: u.kind as any,
            fileKey: u.key,
            fileName: u.name,
            mime: u.type,
            sizeBytes: u.size,
          })) 
        }),
      })
      if (!res.ok) throw new Error("Failed to create project")
      const json = await res.json()
      window.location.href = `/projects/${json.id}`
    } catch (e) {
      console.error(e)
      setIsUploading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Upload AR Project</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="details">Project Details</TabsTrigger>
            <TabsTrigger value="files">Upload Files</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Project Information</CardTitle>
                  <CardDescription>
                    Provide details about your AR project to help others understand and use it.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title</Label>
                    <Input 
                      id="title" 
                      placeholder="Enter a descriptive title" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Short Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Briefly describe your project (max 200 characters)"
                      maxLength={200}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longDescription">Detailed Description</Label>
                    <Textarea
                      id="longDescription"
                      placeholder="Provide a comprehensive description of your project, its features, and use cases"
                      className="min-h-[150px]"
                      value={longDescription}
                      onChange={(e) => setLongDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        placeholder="Add tags (e.g., OpenCV, Face Tracking)"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddTag()
                          }
                        }}
                      />
                      <Button type="button" onClick={handleAddTag} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button type="button" onClick={() => setActiveTab("files")}>
                    Continue to Files
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="files">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Project Files</CardTitle>
                  <CardDescription>
                    Upload your AR project files, including scripts, 3D models, and documentation.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Upload your files</h3>
                    <p className="text-sm text-gray-500 mb-4">Select the type of file you want to upload</p>
                    <div className="flex flex-wrap gap-4 justify-center">
                      <UploadButton<OurFileRouter>
                        endpoint="modelUploader"
                        onClientUploadComplete={(res: any) => {
                          const item = res?.[0]
                          if (item) setUploaded((u) => [...u, { kind: "MODEL", key: item.key, name: item.name, type: item.type || "", size: item.size || 0 }])
                        }}
                        onUploadError={(e: Error) => console.error(e)}
                      />
                      <UploadButton<OurFileRouter>
                        endpoint="scriptUploader"
                        onClientUploadComplete={(res: any) => {
                          const item = res?.[0]
                          if (item) setUploaded((u) => [...u, { kind: "SCRIPT", key: item.key, name: item.name, type: item.type || "", size: item.size || 0 }])
                        }}
                        onUploadError={(e: Error) => console.error(e)}
                      />
                      <UploadButton<OurFileRouter>
                        endpoint="configUploader"
                        onClientUploadComplete={(res: any) => {
                          const item = res?.[0]
                          if (item) setUploaded((u) => [...u, { kind: "CONFIG", key: item.key, name: item.name, type: item.type || "", size: item.size || 0 }])
                        }}
                        onUploadError={(e: Error) => console.error(e)}
                      />
                    </div>
                  </div>

                  {uploaded.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-3">Uploaded Files</h3>
                      <div className="space-y-2">
                        {uploaded.map((u, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div className="flex items-center">
                              {u.kind === "SCRIPT" ? <Code className="h-5 w-5 text-purple-500" /> : <Package className="h-5 w-5 text-blue-500" />}
                              <div className="ml-3">
                                <p className="font-medium">{u.name}</p>
                                <p className="text-xs text-gray-500">{(u.size / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("details")}>
                    Back
                  </Button>
                  <Button type="button" onClick={() => setActiveTab("preview")}>
                    Continue to Preview
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="preview">
              <Card>
                <CardHeader>
                  <CardTitle>Preview & Submit</CardTitle>
                  <CardDescription>Review your project details before submitting.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Project Information</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p className="text-sm text-gray-500 mb-1">Title</p>
                        <p className="mb-3">{title || "Not set"}</p>

                        <p className="text-sm text-gray-500 mb-1">Description</p>
                        <p className="mb-3">{description || "Not set"}</p>

                        <p className="text-sm text-gray-500 mb-1">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                          {tags.length === 0 && <p className="text-gray-400">No tags added</p>}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Files</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        {uploaded.length > 0 ? (
                          <ul className="space-y-1">
                            {uploaded.map((u, index) => (
                              <li key={index} className="flex items-center">
                                {u.kind === "SCRIPT" ? <Code className="h-5 w-5 text-purple-500 mr-2" /> : <Package className="h-5 w-5 text-blue-500 mr-2" />}
                                <span>{u.name}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400">No files uploaded</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("files")}>
                    Back
                  </Button>
                  <Button type="submit" disabled={isUploading}>
                    {isUploading ? "Uploading..." : "Submit Project"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </form>
        </Tabs>
      </div>
    </main>
  )
}
