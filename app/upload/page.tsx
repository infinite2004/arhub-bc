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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Upload, Plus, FileText, Package, Code, AlertCircle, CheckCircle } from "lucide-react"
import { UploadButton } from "@/lib/uploadthing"
import type { OurFileRouter } from "@/app/api/uploadthing/route"
import { useRouter } from "next/navigation"

export default function UploadPage() {
  const router = useRouter()
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [visibility, setVisibility] = useState<"PUBLIC" | "UNLISTED" | "PRIVATE">("PUBLIC")
  const [uploaded, setUploaded] = useState<{ kind: string; key: string; name: string; type: string; size: number }[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadProgress, setUploadProgress] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!title.trim()) {
      newErrors.title = "Title is required"
    } else if (title.length < 3) {
      newErrors.title = "Title must be at least 3 characters"
    } else if (title.length > 120) {
      newErrors.title = "Title must be less than 120 characters"
    }
    
    if (!description.trim()) {
      newErrors.description = "Description is required"
    } else if (description.length < 10) {
      newErrors.description = "Description must be at least 10 characters"
    } else if (description.length > 200) {
      newErrors.description = "Description must be less than 200 characters"
    }
    

    
    if (uploaded.length === 0) {
      newErrors.files = "At least one file must be uploaded"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      if (tags.length >= 10) {
        setErrors({ ...errors, tags: "Maximum 10 tags allowed" })
        return
      }
      setTags([...tags, tagInput.trim()])
      setTagInput("")
      setErrors({ ...errors, tags: "" })
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
    setErrors({ ...errors, tags: "" })
  }

  const handleTabChange = (tab: string) => {
    if (tab === "files" && !validateForm()) {
      return
    }
    if (tab === "preview" && !validateForm()) {
      return
    }
    setActiveTab(tab)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setActiveTab("details")
      return
    }
    
    setIsUploading(true)
    setErrors({})
    
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ 
            title: title.trim(), 
            description: description.trim(), 
            visibility,
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
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to create project")
      }
      
      const json = await res.json()
      router.push(`/projects/${json.id}`)
    } catch (e) {
      console.error(e)
      setErrors({ submit: e instanceof Error ? e.message : "Failed to create project" })
      setIsUploading(false)
    }
  }

  const handleFileUpload = (kind: string, res: any) => {
    const item = res?.[0]
    if (item) {
      setUploaded((u) => [...u, { 
        kind, 
        key: item.key, 
        name: item.name, 
        type: item.type || "", 
        size: item.size || 0 
      }])
      setUploadProgress(prev => ({ ...prev, [item.key]: "Uploaded successfully" }))
      setErrors({ ...errors, files: "" })
    }
  }

  const handleUploadError = (error: Error, kind: string) => {
    console.error(error)
    setErrors({ ...errors, files: `Failed to upload ${kind.toLowerCase()} file` })
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Upload AR Project</h1>

        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{errors.submit}</span>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={handleTabChange}>
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
                    <Label htmlFor="title">Project Title *</Label>
                    <Input 
                      id="title" 
                      placeholder="Enter a descriptive title" 
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value)
                        if (errors.title) setErrors({ ...errors, title: "" })
                      }}
                      className={errors.title ? "border-red-500" : ""}
                    />
                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Short Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Briefly describe your project (10-200 characters)"
                      maxLength={200}
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value)
                        if (errors.description) setErrors({ ...errors, description: "" })
                      }}
                      className={errors.description ? "border-red-500" : ""}
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{errors.description}</span>
                      <span>{description.length}/200</span>
                    </div>
                  </div>



                  <div className="space-y-2">
                    <Label htmlFor="visibility">Project Visibility</Label>
                    <Select value={visibility} onValueChange={(value: any) => setVisibility(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUBLIC">Public - Anyone can view and download</SelectItem>
                        <SelectItem value="UNLISTED">Unlisted - Only accessible via direct link</SelectItem>
                        <SelectItem value="PRIVATE">Private - Only you can access</SelectItem>
                      </SelectContent>
                    </Select>
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
                        className={errors.tags ? "border-red-500" : ""}
                      />
                      <Button type="button" onClick={handleAddTag} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {errors.tags && <p className="text-sm text-red-500">{errors.tags}</p>}

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
                    <p className="text-sm text-gray-500">Add up to 10 tags to help others discover your project</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button" onClick={() => router.push("/projects")}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={() => handleTabChange("files")}>
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
                        onClientUploadComplete={(res: any) => handleFileUpload("MODEL", res)}
                        onUploadError={(e: Error) => handleUploadError(e, "Model")}
                        onUploadBegin={() => setUploadProgress({})}
                      />
                      <UploadButton<OurFileRouter>
                        endpoint="scriptUploader"
                        onClientUploadComplete={(res: any) => handleFileUpload("SCRIPT", res)}
                        onUploadError={(e: Error) => handleUploadError(e, "Script")}
                        onUploadBegin={() => setUploadProgress({})}
                      />
                      <UploadButton<OurFileRouter>
                        endpoint="configUploader"
                        onClientUploadComplete={(res: any) => handleFileUpload("CONFIG", res)}
                        onUploadError={(e: Error) => handleUploadError(e, "Config")}
                        onUploadBegin={() => setUploadProgress({})}
                      />
                    </div>
                  </div>

                  {errors.files && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <span className="text-red-700">{errors.files}</span>
                    </div>
                  )}

                  {uploaded.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-3">Uploaded Files</h3>
                      <div className="space-y-2">
                        {uploaded.map((u, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div className="flex items-center">
                              {u.kind === "SCRIPT" ? <Code className="h-5 w-5 text-purple-500" /> : 
                               u.kind === "MODEL" ? <Package className="h-5 w-5 text-blue-500" /> :
                               <FileText className="h-5 w-5 text-green-500" />}
                              <div className="ml-3">
                                <p className="font-medium">{u.name}</p>
                                <p className="text-xs text-gray-500">{(u.size / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {uploadProgress[u.key] && (
                                <span className="text-sm text-green-600 flex items-center gap-1">
                                  <CheckCircle className="h-4 w-4" />
                                  {uploadProgress[u.key]}
                                </span>
                              )}
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
                  <Button type="button" onClick={() => handleTabChange("preview")}>
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

                        <p className="text-sm text-gray-500 mb-1">Short Description</p>
                        <p className="mb-3">{description || "Not set"}</p>



                        <p className="text-sm text-gray-500 mb-1">Visibility</p>
                        <p className="mb-3 capitalize">{visibility.toLowerCase()}</p>

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
                                {u.kind === "SCRIPT" ? <Code className="h-5 w-5 text-purple-500 mr-2" /> : 
                                 u.kind === "MODEL" ? <Package className="h-5 w-5 text-blue-500 mr-2" /> :
                                 <FileText className="h-5 w-5 text-green-500 mr-2" />}
                                <span>{u.name}</span>
                                <span className="text-sm text-gray-500 ml-2">({(u.size / 1024).toFixed(1)} KB)</span>
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
                    {isUploading ? "Creating Project..." : "Submit Project"}
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
