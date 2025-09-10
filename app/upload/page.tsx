"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Upload, Plus, FileText, Package, Code, AlertCircle, CheckCircle, Loader2, Trash2, Image, File, Eye, EyeOff } from "lucide-react"
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
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())
  const [dragActive, setDragActive] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({})
  const dragRef = useRef<HTMLDivElement>(null)

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

  const handleRemoveFile = (fileKey: string) => {
    setUploaded(uploaded.filter(f => f.key !== fileKey))
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[fileKey]
      return newProgress
    })
    setErrors({ ...errors, files: "" })
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
      setUploadingFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(item.key)
        return newSet
      })
      setErrors({ ...errors, files: "" })
    }
  }

  const handleUploadError = (error: Error, kind: string) => {
    console.error(error)
    setErrors({ ...errors, files: `Failed to upload ${kind.toLowerCase()} file` })
    setUploadingFiles(prev => {
      const newSet = new Set(prev)
      // Remove any files that might be in progress for this kind
      return newSet
    })
  }

  const handleUploadBegin = (fileName: string) => {
    setUploadingFiles(prev => new Set([...prev, fileName]))
    setUploadProgress(prev => ({ ...prev, [fileName]: "Uploading..." }))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files)
      handleFiles(files)
    }
  }, [])

  const handleFiles = (files: File[]) => {
    files.forEach(file => {
      // Validate file type and size
      const maxSize = 100 * 1024 * 1024 // 100MB
      if (file.size > maxSize) {
        setErrors({ ...errors, files: `File ${file.name} is too large. Maximum size is 100MB.` })
        return
      }

      // Determine file kind based on extension
      const extension = file.name.split('.').pop()?.toLowerCase()
      let kind = 'CONFIG'
      
      if (['glb', 'gltf', 'obj', 'fbx', 'dae'].includes(extension || '')) {
        kind = 'MODEL'
      } else if (['py', 'js', 'ts', 'jsx', 'tsx', 'cpp', 'c', 'java'].includes(extension || '')) {
        kind = 'SCRIPT'
      }

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setFilePreviews(prev => ({ ...prev, [file.name]: e.target?.result as string }))
        }
        reader.readAsDataURL(file)
      }

      // Simulate file upload (in real app, this would upload to server)
      const mockUpload = {
        kind,
        key: `mock-${Date.now()}-${file.name}`,
        name: file.name,
        type: file.type,
        size: file.size
      }
      
      setUploaded(prev => [...prev, mockUpload])
      setUploadProgress(prev => ({ ...prev, [mockUpload.key]: "Uploaded successfully" }))
    })
  }

  const togglePreviewMode = () => {
    setPreviewMode(!previewMode)
  }

  const getFileIcon = (kind: string) => {
    switch (kind) {
      case "SCRIPT": return <Code className="h-5 w-5 text-purple-500" />
      case "MODEL": return <Package className="h-5 w-5 text-blue-500" />
      case "CONFIG": return <FileText className="h-5 w-5 text-green-500" />
      default: return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getFileTypeLabel = (kind: string) => {
    switch (kind) {
      case "SCRIPT": return "Script"
      case "MODEL": return "3D Model"
      case "CONFIG": return "Configuration"
      default: return "File"
    }
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload AR Project</h1>
          <p className="text-gray-600">Share your AR project with the community</p>
        </div>

        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{errors.submit}</span>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-8 grid w-full grid-cols-3">
            <TabsTrigger value="details">Project Details</TabsTrigger>
            <TabsTrigger value="files">Upload Files</TabsTrigger>
            <TabsTrigger value="preview">Preview & Submit</TabsTrigger>
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
                  {/* Drag and Drop Zone */}
                  <div 
                    ref={dragRef}
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Upload className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          Drag and drop files here
                        </p>
                        <p className="text-sm text-gray-500">
                          or click the upload buttons below
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <span>Supports: .glb, .gltf, .obj, .py, .js, .ts, .json, .yaml</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <Package className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                      <h3 className="font-medium mb-2">3D Models</h3>
                      <p className="text-sm text-gray-500 mb-3">Upload .glb, .gltf, .obj files</p>
                      <UploadButton<OurFileRouter>
                        endpoint="modelUploader"
                        onClientUploadComplete={(res: any) => handleFileUpload("MODEL", res)}
                        onUploadError={(e: Error) => handleUploadError(e, "Model")}
                        onUploadBegin={() => handleUploadBegin("model")}
                        className="w-full"
                      />
                    </div>

                    <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                      <Code className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                      <h3 className="font-medium mb-2">Scripts</h3>
                      <p className="text-sm text-gray-500 mb-3">Upload .py, .js, .ts files</p>
                      <UploadButton<OurFileRouter>
                        endpoint="scriptUploader"
                        onClientUploadComplete={(res: any) => handleFileUpload("SCRIPT", res)}
                        onUploadError={(e: Error) => handleUploadError(e, "Script")}
                        onUploadBegin={() => handleUploadBegin("script")}
                        className="w-full"
                      />
                    </div>

                    <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                      <FileText className="h-8 w-8 text-green-500 mx-auto mb-3" />
                      <h3 className="font-medium mb-2">Config Files</h3>
                      <p className="text-sm text-gray-500 mb-3">Upload .json, .yaml, .txt files</p>
                      <UploadButton<OurFileRouter>
                        endpoint="configUploader"
                        onClientUploadComplete={(res: any) => handleFileUpload("CONFIG", res)}
                        onUploadError={(e: Error) => handleUploadError(e, "Config")}
                        onUploadBegin={() => handleUploadBegin("config")}
                        className="w-full"
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
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium">Uploaded Files ({uploaded.length})</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={togglePreviewMode}
                          className="flex items-center gap-2"
                        >
                          {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          {previewMode ? 'Hide Previews' : 'Show Previews'}
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {uploaded.map((u, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg border overflow-hidden">
                            <div className="flex items-center justify-between p-4">
                              <div className="flex items-center flex-1">
                                {getFileIcon(u.kind)}
                                <div className="ml-3 flex-1">
                                  <p className="font-medium">{u.name}</p>
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span>{getFileTypeLabel(u.kind)}</span>
                                    <span>{formatFileSize(u.size)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {uploadingFiles.has(u.key) ? (
                                  <div className="flex items-center gap-2 text-blue-600">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm">Uploading...</span>
                                  </div>
                                ) : uploadProgress[u.key] ? (
                                  <span className="text-sm text-green-600 flex items-center gap-1">
                                    <CheckCircle className="h-4 w-4" />
                                    {uploadProgress[u.key]}
                                  </span>
                                ) : null}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveFile(u.key)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* File Preview */}
                            {previewMode && filePreviews[u.name] && (
                              <div className="border-t bg-white p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Image className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm font-medium text-gray-700">Preview</span>
                                </div>
                                <div className="max-w-xs">
                                  <img 
                                    src={filePreviews[u.name]} 
                                    alt={u.name}
                                    className="rounded border max-h-32 object-contain"
                                  />
                                </div>
                              </div>
                            )}
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
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Project Information
                      </h3>
                      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Title</p>
                          <p className="text-lg">{title || "Not set"}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                          <p className="text-gray-700">{description || "Not set"}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Visibility</p>
                          <Badge variant={visibility === "PUBLIC" ? "default" : visibility === "UNLISTED" ? "secondary" : "outline"}>
                            {visibility.toLowerCase()}
                          </Badge>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-2">Tags</p>
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
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Files ({uploaded.length})
                      </h3>
                      <div className="bg-gray-50 p-6 rounded-lg">
                        {uploaded.length > 0 ? (
                          <div className="space-y-3">
                            {uploaded.map((u, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-md border">
                                <div className="flex items-center">
                                  {getFileIcon(u.kind)}
                                  <div className="ml-3">
                                    <p className="font-medium">{u.name}</p>
                                    <p className="text-sm text-gray-500">{getFileTypeLabel(u.kind)} • {formatFileSize(u.size)}</p>
                                  </div>
                                </div>
                                <Badge variant="outline">{u.kind}</Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-center py-8">No files uploaded</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("files")}>
                    Back
                  </Button>
                  <Button type="submit" disabled={isUploading} className="min-w-[140px]">
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      "Submit Project"
                    )}
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
