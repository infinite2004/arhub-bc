"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface DownloadButtonProps {
  projectId: string
  className?: string
}

export default function DownloadButton({ projectId, className }: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  const handleDownload = async () => {
    if (!session) {
      router.push("/signin")
      return
    }

    setIsDownloading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Download failed")
      }

      const data = await response.json()
      
      // Create a download manifest file
      const manifest = {
        project: data.project,
        assets: data.assets,
        metadata: data.metadata,
        instructions: "Download the files using the provided URLs and follow the project documentation.",
      }

      // Create and download the manifest
      const blob = new Blob([JSON.stringify(manifest, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${data.project.title}-manifest.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Show success message
      alert(`Download started! Project: ${data.project.title}\nTotal files: ${data.metadata.totalFiles}\nTotal size: ${(data.metadata.totalSize / 1024 / 1024).toFixed(2)} MB`)
    } catch (error) {
      console.error("Download error:", error)
      alert("Download failed. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading}
      className={className}
    >
      {isDownloading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {isDownloading ? "Downloading..." : "Download Project"}
    </Button>
  )
}
