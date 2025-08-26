import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createProjectSchema } from "@/lib/zod-schemas";
import { getServerSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const tags = (searchParams.get("tags") ?? "").split(",").filter(Boolean);
  const owner = searchParams.get("owner");
  const visibility = searchParams.get("visibility");
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = 12;

  const where: any = {};
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (owner) where.ownerId = owner;
  if (visibility) where.visibility = visibility as any;
  if (tags.length) {
    where.tags = { some: { tag: { slug: { in: tags } } } };
  }

  const items = await prisma.project.findMany({
    where,
    include: {
      owner: { select: { id: true, name: true, image: true } },
      tags: { include: { tag: true } },
      assets: true,
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize + 1,
  });

  const hasNext = items.length > pageSize;
  if (hasNext) items.pop();

  return NextResponse.json({ items, nextCursor: hasNext ? page + 1 : null });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { title, description, tags, visibility, assets } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const created = await prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        title,
        description,
        visibility,
        ownerId: user.id,
      },
    });

    if (tags?.length) {
      // ensure tags exist
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
        data: tagRows.map((t) => ({ projectId: project.id, tagId: t.id })),
        skipDuplicates: true,
      });
    }

    if (assets?.length) {
      await tx.asset.createMany({
        data: assets.map((a) => ({ ...a, projectId: project.id })),
      });
    }

    return project.id;
  });

  return NextResponse.json({ id: created });
}

