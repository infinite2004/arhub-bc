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
import { X, Upload, Plus, FileText, Package, Code, AlertCircle, CheckCircle, Loader2, Trash2, Image, File, Eye, EyeOff, Zap, Download, Info, FileImage, FileVideo, FileAudio, Archive, Play, Pause, RotateCcw, Maximize2, Minimize2, Copy, Share2, Star, Clock, User, Calendar } from "lucide-react"
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
  const [uploadStats, setUploadStats] = useState({ totalSize: 0, fileCount: 0 })
  const [dragCounter, setDragCounter] = useState(0)
  const [uploadQueue, setUploadQueue] = useState<Array<{id: string, file: File, progress: number, status: 'pending' | 'uploading' | 'completed' | 'error'}>>([])
  const [expandedPreview, setExpandedPreview] = useState<string | null>(null)
  const [fileMetadata, setFileMetadata] = useState<Record<string, any>>({})
  const [compressionEnabled, setCompressionEnabled] = useState(true)
  const [compressionProgress, setCompressionProgress] = useState<Record<string, number>>({})
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
    const fileToRemove = uploaded.find(f => f.key === fileKey)
    setUploaded(uploaded.filter(f => f.key !== fileKey))
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[fileKey]
      return newProgress
    })
    setErrors({ ...errors, files: "" })
    
    // Update upload stats
    if (fileToRemove) {
      setUploadStats(prev => ({
        totalSize: prev.totalSize - fileToRemove.size,
        fileCount: prev.fileCount - 1
      }))
    }
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
      const newFile = { 
        kind, 
        key: item.key, 
        name: item.name, 
        type: item.type || "", 
        size: item.size || 0 
      }
      setUploaded((u) => [...u, newFile])
      setUploadProgress(prev => ({ ...prev, [item.key]: "Uploaded successfully" }))
      setUploadingFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(item.key)
        return newSet
      })
      setErrors({ ...errors, files: "" })
      
      // Update upload stats
      setUploadStats(prev => ({
        totalSize: prev.totalSize + newFile.size,
        fileCount: prev.fileCount + 1
      }))
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

  const extractFileMetadata = async (file: File) => {
    const metadata: any = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified),
      extension: file.name.split('.').pop()?.toLowerCase()
    }

    // Extract additional metadata based on file type
    if (file.type.startsWith('image/')) {
      try {
        const img = new window.Image()
        const url = URL.createObjectURL(file)
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject(new Error('Failed to load image'))
          img.src = url
        })
        metadata.dimensions = { width: img.width, height: img.height }
        metadata.aspectRatio = (img.width / img.height).toFixed(2)
        URL.revokeObjectURL(url)
      } catch (e) {
        console.warn('Could not extract image metadata:', e)
      }
    }

    if (file.type.startsWith('video/')) {
      try {
        const video = document.createElement('video')
        const url = URL.createObjectURL(file)
        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => resolve()
          video.onerror = () => reject(new Error('Failed to load video'))
          video.src = url
        })
        metadata.dimensions = { width: video.videoWidth, height: video.videoHeight }
        metadata.duration = video.duration
        URL.revokeObjectURL(url)
      } catch (e) {
        console.warn('Could not extract video metadata:', e)
      }
    }

    if (file.type.startsWith('audio/')) {
      try {
        const audio = document.createElement('audio')
        const url = URL.createObjectURL(file)
        await new Promise<void>((resolve, reject) => {
          audio.onloadedmetadata = () => resolve()
          audio.onerror = () => reject(new Error('Failed to load audio'))
          audio.src = url
        })
        metadata.duration = audio.duration
        URL.revokeObjectURL(url)
      } catch (e) {
        console.warn('Could not extract audio metadata:', e)
      }
    }

    return metadata
  }

  const compressImage = async (file: File, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new window.Image()
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new (File as any)([blob], file.name, { type: file.type })
            resolve(compressedFile)
          } else {
            resolve(file)
          }
        }, file.type, quality)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const processFile = async (file: File): Promise<File> => {
    if (!compressionEnabled) return file
    
    // Only compress images
    if (file.type.startsWith('image/') && file.size > 1024 * 1024) { // > 1MB
      try {
        const compressed = await compressImage(file, 0.8)
        return compressed
      } catch (e) {
        console.warn('Compression failed, using original file:', e)
        return file
      }
    }
    
    return file
  }

  const simulateUploadProgress = (fileId: string, file: File) => {
    return new Promise<void>((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 15
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          setUploadQueue(prev => prev.map(item => 
            item.id === fileId 
              ? { ...item, progress: 100, status: 'completed' as const }
              : item
          ))
          resolve()
        } else {
          setUploadQueue(prev => prev.map(item => 
            item.id === fileId 
              ? { ...item, progress, status: 'uploading' as const }
              : item
          ))
        }
      }, 200)
    })
  }

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter") {
      setDragCounter(prev => prev + 1)
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragCounter(prev => prev - 1)
      if (dragCounter === 1) {
        setDragActive(false)
      }
    } else if (e.type === "dragover") {
      setDragActive(true)
    }
  }, [dragCounter])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setDragCounter(0)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files)
      handleFiles(files)
    }
  }, [])

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    const maxSize = 100 * 1024 * 1024 // 100MB
    const allowedExtensions = [
      // 3D Models
      'glb', 'gltf', 'obj', 'fbx', 'dae', 'blend', '3ds', 'ply', 'stl',
      // Scripts
      'py', 'js', 'ts', 'jsx', 'tsx', 'cpp', 'c', 'java', 'cs', 'php', 'rb', 'go', 'rs',
      // Config files
      'json', 'yaml', 'yml', 'xml', 'toml', 'ini', 'cfg', 'conf',
      // Images
      'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'tiff',
      // Videos
      'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv',
      // Audio
      'mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a',
      // Archives
      'zip', 'rar', '7z', 'tar', 'gz', 'bz2',
      // Documents
      'pdf', 'doc', 'docx', 'txt', 'md', 'rtf'
    ]

    if (file.size > maxSize) {
      return { isValid: false, error: `File ${file.name} is too large. Maximum size is 100MB.` }
    }

    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !allowedExtensions.includes(extension)) {
      return { isValid: false, error: `File type .${extension} is not supported.` }
    }

    return { isValid: true }
  }

  const handleFiles = async (files: File[]) => {
    const validFiles: File[] = []
    const errors: string[] = []

    files.forEach(file => {
      const validation = validateFile(file)
      if (validation.isValid) {
        validFiles.push(file)
      } else {
        errors.push(validation.error || 'Invalid file')
      }
    })

    if (errors.length > 0) {
      setErrors(prev => ({ ...prev, files: errors.join(', ') }))
    }

    for (const file of validFiles) {
      // Determine file kind based on extension
      const extension = file.name.split('.').pop()?.toLowerCase()
      let kind = 'CONFIG'
      
      if (['glb', 'gltf', 'obj', 'fbx', 'dae', 'blend', '3ds', 'ply', 'stl'].includes(extension || '')) {
        kind = 'MODEL'
      } else if (['py', 'js', 'ts', 'jsx', 'tsx', 'cpp', 'c', 'java', 'cs', 'php', 'rb', 'go', 'rs'].includes(extension || '')) {
        kind = 'SCRIPT'
      }

      const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Add to upload queue
      setUploadQueue(prev => [...prev, {
        id: fileId,
        file,
        progress: 0,
        status: 'pending'
      }])

      // Process file (compression if enabled)
      const processedFile = await processFile(file)
      
      // Extract metadata
      try {
        const metadata = await extractFileMetadata(processedFile)
        setFileMetadata(prev => ({ ...prev, [fileId]: metadata }))
      } catch (e) {
        console.warn('Failed to extract metadata for', file.name)
      }

      // Create preview for images
      if (processedFile.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setFilePreviews(prev => ({ ...prev, [fileId]: e.target?.result as string }))
        }
        reader.readAsDataURL(processedFile)
      }

      // Simulate upload progress
      await simulateUploadProgress(fileId, processedFile)

      // Add to uploaded files after completion
      const mockUpload = {
        kind,
        key: fileId,
        name: processedFile.name,
        type: processedFile.type,
        size: processedFile.size
      }
      
      setUploaded(prev => [...prev, mockUpload])
      setUploadProgress(prev => ({ ...prev, [fileId]: "Uploaded successfully" }))
      
      // Update upload stats
      setUploadStats(prev => ({
        totalSize: prev.totalSize + processedFile.size,
        fileCount: prev.fileCount + 1
      }))

      // Remove from upload queue
      setUploadQueue(prev => prev.filter(item => item.id !== fileId))
    }
  }

  const togglePreviewMode = () => {
    setPreviewMode(!previewMode)
  }

  const getFileIcon = (kind: string, fileType?: string) => {
    if (fileType?.startsWith('image/')) return <FileImage className="h-5 w-5 text-pink-500" />
    if (fileType?.startsWith('video/')) return <FileVideo className="h-5 w-5 text-red-500" />
    if (fileType?.startsWith('audio/')) return <FileAudio className="h-5 w-5 text-yellow-500" />
    if (fileType?.includes('zip') || fileType?.includes('rar') || fileType?.includes('7z')) return <Archive className="h-5 w-5 text-orange-500" />
    
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
                  {/* Upload Settings */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-gray-500" />
                          <span className="font-medium text-gray-900">Upload Settings</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 text-sm text-gray-600">
                            <input
                              type="checkbox"
                              checked={compressionEnabled}
                              onChange={(e) => setCompressionEnabled(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            Auto-compress images
                          </label>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {compressionEnabled ? 'Images >1MB will be compressed' : 'No compression'}
                      </div>
                    </div>
                  </div>

                  {/* Upload Statistics */}
                  {uploadStats.fileCount > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-blue-500" />
                            <span className="font-medium text-gray-900">
                              {uploadStats.fileCount} file{uploadStats.fileCount !== 1 ? 's' : ''} uploaded
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Download className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {formatFileSize(uploadStats.totalSize)} total
                            </span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          Ready to submit
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Drag and Drop Zone */}
                  <div 
                    ref={dragRef}
                    className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
                      dragActive 
                        ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-lg' 
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    role="button"
                    tabIndex={0}
                    aria-label="Drag and drop files here or click to browse"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        document.getElementById('bulk-upload')?.click()
                      }
                    }}
                  >
                    <div className="space-y-6">
                      <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
                        dragActive 
                          ? 'bg-blue-100 scale-110' 
                          : 'bg-gray-100'
                      }`}>
                        <Upload className={`h-10 w-10 transition-colors duration-200 ${
                          dragActive ? 'text-blue-500' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <p className={`text-xl font-semibold transition-colors duration-200 ${
                          dragActive ? 'text-blue-700' : 'text-gray-900'
                        }`}>
                          {dragActive ? 'Drop files here!' : 'Drag and drop files here'}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          or click the upload buttons below
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400">
                        <span className="bg-gray-100 px-2 py-1 rounded">3D Models: .glb, .gltf, .obj</span>
                        <span className="bg-gray-100 px-2 py-1 rounded">Scripts: .py, .js, .ts</span>
                        <span className="bg-gray-100 px-2 py-1 rounded">Images: .jpg, .png, .svg</span>
                        <span className="bg-gray-100 px-2 py-1 rounded">Docs: .pdf, .md, .txt</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <Info className="h-3 w-3" />
                        <span>Maximum file size: 100MB per file</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors group">
                      <Package className="h-8 w-8 text-blue-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
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

                    <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors group">
                      <Code className="h-8 w-8 text-purple-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
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

                    <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors group">
                      <FileText className="h-8 w-8 text-green-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
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

                    <div className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors group">
                      <Upload className="h-8 w-8 text-orange-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                      <h3 className="font-medium mb-2">Bulk Upload</h3>
                      <p className="text-sm text-gray-500 mb-3">Upload multiple files at once</p>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => {
                          if (e.target.files) {
                            handleFiles(Array.from(e.target.files))
                          }
                        }}
                        className="hidden"
                        id="bulk-upload"
                        accept=".glb,.gltf,.obj,.py,.js,.ts,.json,.yaml,.jpg,.jpeg,.png,.pdf,.md,.txt"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById('bulk-upload')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>
                  </div>

                  {errors.files && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <span className="text-red-700">{errors.files}</span>
                    </div>
                  )}

                  {/* Upload Queue */}
                  {uploadQueue.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                        Upload Queue ({uploadQueue.length})
                      </h3>
                      <div className="space-y-3">
                        {uploadQueue.map((item) => (
                          <div key={item.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                {getFileIcon('CONFIG', item.file.type)}
                                <div>
                                  <p className="font-medium text-gray-900">{item.file.name}</p>
                                  <p className="text-sm text-gray-500">{formatFileSize(item.file.size)}</p>
                                </div>
                              </div>
                              <Badge variant={item.status === 'completed' ? 'default' : item.status === 'error' ? 'destructive' : 'secondary'}>
                                {item.status}
                              </Badge>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{Math.round(item.progress)}% complete</p>
                          </div>
                        ))}
                      </div>
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
                                {getFileIcon(u.kind, u.type)}
                                <div className="ml-3 flex-1">
                                  <p className="font-medium">{u.name}</p>
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span>{getFileTypeLabel(u.kind)}</span>
                                    <span>{formatFileSize(u.size)}</span>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                      {u.type || 'Unknown type'}
                                    </span>
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
                            
                            {/* Enhanced File Preview */}
                            {previewMode && (
                              <div className="border-t bg-white p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">Preview & Details</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setExpandedPreview(expandedPreview === u.key ? null : u.key)}
                                    >
                                      {expandedPreview === u.key ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => navigator.clipboard.writeText(u.name)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Image Preview */}
                                {filePreviews[u.key] && u.type.startsWith('image/') && (
                                  <div className={`${expandedPreview === u.key ? 'max-w-full' : 'max-w-xs'} mb-4`}>
                                    <img 
                                      src={filePreviews[u.key]} 
                                      alt={u.name}
                                      className="rounded border object-contain bg-gray-50"
                                      style={{ 
                                        maxHeight: expandedPreview === u.key ? '400px' : '128px',
                                        width: 'auto'
                                      }}
                                    />
                                  </div>
                                )}

                                {/* File Metadata */}
                                {fileMetadata[u.key] && (
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className="font-medium text-gray-700 mb-2">File Information</p>
                                      <div className="space-y-1">
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">Size:</span>
                                          <span>{formatFileSize(fileMetadata[u.key].size)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">Type:</span>
                                          <span>{fileMetadata[u.key].type || 'Unknown'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">Modified:</span>
                                          <span>{fileMetadata[u.key].lastModified?.toLocaleDateString()}</span>
                                        </div>
                                        {fileMetadata[u.key].dimensions && (
                                          <div className="flex justify-between">
                                            <span className="text-gray-500">Dimensions:</span>
                                            <span>{fileMetadata[u.key].dimensions.width} × {fileMetadata[u.key].dimensions.height}</span>
                                          </div>
                                        )}
                                        {fileMetadata[u.key].duration && (
                                          <div className="flex justify-between">
                                            <span className="text-gray-500">Duration:</span>
                                            <span>{Math.round(fileMetadata[u.key].duration)}s</span>
                                          </div>
                                        )}
                                        {fileMetadata[u.key].aspectRatio && (
                                          <div className="flex justify-between">
                                            <span className="text-gray-500">Aspect Ratio:</span>
                                            <span>{fileMetadata[u.key].aspectRatio}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <p className="font-medium text-gray-700 mb-2">Actions</p>
                                      <div className="space-y-2">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          className="w-full justify-start"
                                          onClick={() => {
                                            const link = document.createElement('a')
                                            link.href = filePreviews[u.key] || '#'
                                            link.download = u.name
                                            link.click()
                                          }}
                                        >
                                          <Download className="h-4 w-4 mr-2" />
                                          Download
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          className="w-full justify-start"
                                          onClick={() => {
                                            if (navigator.share) {
                                              navigator.share({
                                                title: u.name,
                                                text: `Check out this file: ${u.name}`,
                                                url: window.location.href
                                              })
                                            }
                                          }}
                                        >
                                          <Share2 className="h-4 w-4 mr-2" />
                                          Share
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Code Preview for Scripts */}
                                {u.kind === 'SCRIPT' && u.type && (
                                  <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Code Preview</p>
                                    <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Code className="h-3 w-3" />
                                        <span>{u.name}</span>
                                      </div>
                                      <div className="text-gray-400">
                                        {u.type.includes('javascript') ? '// JavaScript file' :
                                         u.type.includes('python') ? '# Python file' :
                                         u.type.includes('typescript') ? '// TypeScript file' :
                                         '// Code file'} - Preview not available in demo
                                      </div>
                                    </div>
                                  </div>
                                )}
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
                                  {getFileIcon(u.kind, u.type)}
                                  <div className="ml-3">
                                    <p className="font-medium">{u.name}</p>
                                    <p className="text-sm text-gray-500">{getFileTypeLabel(u.kind)} • {formatFileSize(u.size)}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{u.kind}</Badge>
                                  <span className="text-xs text-gray-400">{u.type}</span>
                                </div>
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
