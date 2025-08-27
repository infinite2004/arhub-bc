import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const projectId = params.id

    // Get the project with all assets
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        assets: true,
        owner: true,
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Check if project is public or user is the owner
    if (project.visibility === "PRIVATE" && project.owner.email !== session.user.email) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Record the download
    await prisma.download.create({
      data: {
        projectId,
        userId: session.user.email,
      },
    })

    // Prepare download data
    const downloadData = {
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
      assets: project.assets.map(asset => ({
        id: asset.id,
        kind: asset.kind,
        fileName: asset.fileName,
        fileKey: asset.fileKey,
        mime: asset.mime,
        sizeBytes: asset.sizeBytes,
      })),
      metadata: {
        totalFiles: project.assets.length,
        totalSize: project.assets.reduce((sum, asset) => sum + asset.sizeBytes, 0),
        downloadTimestamp: new Date().toISOString(),
      },
    }

    return NextResponse.json(downloadData)
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

