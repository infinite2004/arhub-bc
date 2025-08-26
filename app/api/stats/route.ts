import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const [projects, users, downloads] = await Promise.all([
    prisma.project.count(),
    prisma.user.count(),
    prisma.download.count(),
  ]);
  return NextResponse.json({ projects, users, downloads });
}

