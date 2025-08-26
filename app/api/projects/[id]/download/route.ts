import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { assets: true },
  });
  if (!project) return new NextResponse("Not found", { status: 404 });

  // Log download (anonymous for now)
  await prisma.download.create({ data: { projectId: project.id } });

  // Placeholder: return 202 and let frontend poll for ZIP URL (to be implemented)
  return NextResponse.json({ status: "accepted" }, { status: 202 });
}

