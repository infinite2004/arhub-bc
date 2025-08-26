import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { updateProjectSchema } from "@/lib/zod-schemas";
import { getSignedGetUrl, publicUrlFromKey } from "@/lib/storage";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      owner: { select: { id: true, name: true, image: true } },
      tags: { include: { tag: true } },
      assets: true,
    },
  });
  if (!project) return new NextResponse("Not found", { status: 404 });
  // Attach URLs for assets
  const assetsWithUrls = await Promise.all(
    project.assets.map(async (a) => {
      const publicUrl = publicUrlFromKey(a.fileKey);
      return {
        ...a,
        url: publicUrl ?? (await getSignedGetUrl(process.env.S3_BUCKET_PUBLIC || "", a.fileKey).catch(() => null)),
      };
    })
  );
  return NextResponse.json({ ...project, assets: assetsWithUrls });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return new NextResponse("Unauthorized", { status: 401 });

  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return new NextResponse("Not found", { status: 404 });
  const isOwner = project.ownerId === me.id;
  const isAdmin = (session.user as any).role === "ADMIN";
  if (!isOwner && !isAdmin) return new NextResponse("Forbidden", { status: 403 });

  const body = await req.json();
  const parsed = updateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, description, visibility, tags } = parsed.data;

  const updated = await prisma.$transaction(async (tx) => {
    const p = await tx.project.update({
      where: { id: params.id },
      data: { title, description, visibility },
    });
    if (tags) {
      // reset tags
      await tx.projectTag.deleteMany({ where: { projectId: params.id } });
      if (tags.length) {
        const tagRows = await Promise.all(
          tags.map((slug) =>
            tx.tag.upsert({
              where: { slug },
              update: {},
              create: { slug, name: slug },
            })
          )
        );
        await tx.projectTag.createMany({
          data: tagRows.map((t) => ({ projectId: params.id, tagId: t.id })),
          skipDuplicates: true,
        });
      }
    }
    return p;
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return new NextResponse("Unauthorized", { status: 401 });
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return new NextResponse("Not found", { status: 404 });
  const isOwner = project.ownerId === me.id;
  const isAdmin = (session.user as any).role === "ADMIN";
  if (!isOwner && !isAdmin) return new NextResponse("Forbidden", { status: 403 });

  await prisma.project.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}

