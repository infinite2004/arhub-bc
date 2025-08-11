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

export default function UploadPage() {
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleRemoveFile = (fileToRemove: File) => {
    setFiles(files.filter((file) => file !== fileToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    // Simulate upload
    setTimeout(() => {
      setIsUploading(false)
      // Reset form or redirect
    }, 2000)
  }

  const getFileIcon = (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase()

    if (["py", "js", "cpp", "h", "c"].includes(extension || "")) {
      return <Code className="h-5 w-5 text-purple-500" />
    } else if (["obj", "fbx", "glb", "gltf"].includes(extension || "")) {
      return <Package className="h-5 w-5 text-blue-500" />
    } else if (["zip", "rar", "tar", "gz"].includes(extension || "")) {
      return <Package className="h-5 w-5 text-green-500" />
    } else {
      return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Upload AR Project</h1>

        <Tabs defaultValue="details">
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
                    <Input id="title" placeholder="Enter a descriptive title" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Short Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Briefly describe your project (max 200 characters)"
                      maxLength={200}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longDescription">Detailed Description</Label>
                    <Textarea
                      id="longDescription"
                      placeholder="Provide a comprehensive description of your project, its features, and use cases"
                      className="min-h-[150px]"
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
                  <Button type="button" onClick={() => document.querySelector('[data-value="files"]')?.click()}>
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
                    <h3 className="text-lg font-medium mb-2">Drag and drop files here</h3>
                    <p className="text-sm text-gray-500 mb-4">or click to browse your files</p>
                    <Input type="file" multiple className="hidden" id="file-upload" onChange={handleFileChange} />
                    <Button type="button" onClick={() => document.getElementById("file-upload")?.click()}>
                      Select Files
                    </Button>
                  </div>

                  {files.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-3">Selected Files</h3>
                      <div className="space-y-2">
                        {files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div className="flex items-center">
                              {getFileIcon(file)}
                              <div className="ml-3">
                                <p className="font-medium">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFile(file)}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => document.querySelector('[data-value="details"]')?.click()}>
                    Back
                  </Button>
                  <Button type="button" onClick={() => document.querySelector('[data-value="preview"]')?.click()}>
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
                        <p className="mb-3">Face Tracking AR Mask</p>

                        <p className="text-sm text-gray-500 mb-1">Description</p>
                        <p className="mb-3">A face tracking AR mask using OpenCV and 3D models</p>

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
                        {files.length > 0 ? (
                          <ul className="space-y-1">
                            {files.map((file, index) => (
                              <li key={index} className="flex items-center">
                                {getFileIcon(file)}
                                <span className="ml-2">{file.name}</span>
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
                  <Button variant="outline" onClick={() => document.querySelector('[data-value="files"]')?.click()}>
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
