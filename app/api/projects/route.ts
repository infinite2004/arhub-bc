import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createProjectSchema } from "@/lib/zod-schemas";
import { getServerSession } from "@/lib/auth";
import { rateLimit } from "@/lib/security";
import { z } from "zod";
import { AppError } from "@/types";

// Enhanced query schema for GET requests
const getProjectsSchema = z.object({
  q: z.string().optional(),
  tags: z.string().optional().transform(val => val ? val.split(",").filter(Boolean) : []),
  owner: z.string().optional(),
  visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]).optional(),
  category: z.string().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "stars", "views"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.string().transform(Number).pipe(z.number().min(1).max(100)).default(1),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).default(12),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    
    const {
      q,
      tags,
      owner,
      visibility,
      category,
      sortBy,
      sortOrder,
      page,
      limit,
    } = getProjectsSchema.parse(params);

    // Build where clause with enhanced filtering
    const where: any = {
      isArchived: false, // Only show non-archived projects
    };

    // Text search with improved relevance
    if (q) {
      const searchTerms = q.trim().split(/\s+/).filter(term => term.length > 0);
      if (searchTerms.length === 1) {
        where.OR = [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { tags: { some: { tag: { name: { contains: q, mode: "insensitive" } } } } },
        ];
      } else {
        where.AND = searchTerms.map(term => ({
          OR: [
            { title: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
            { tags: { some: { tag: { name: { contains: term, mode: "insensitive" } } } } },
          ]
        }));
      }
    }

    // Additional filters
    if (owner) where.ownerId = owner;
    if (visibility) where.visibility = visibility;
    if (category) where.category = category;
    if (tags.length) {
      where.tags = { some: { tag: { slug: { in: tags } } } };
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Execute query with enhanced includes
    const [items, totalCount] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          owner: { 
            select: { 
              id: true, 
              name: true, 
              image: true,
              role: true,
            } 
          },
          tags: { 
            include: { 
              tag: { 
                select: { 
                  id: true, 
                  name: true, 
                  slug: true, 
                  color: true 
                } 
              } 
            } 
          },
          assets: {
            select: {
              id: true,
              kind: true,
              fileName: true,
              mime: true,
              sizeBytes: true,
              isPrimary: true,
            }
          },
          _count: {
            select: {
              downloads: true,
              assets: true,
            }
          }
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        projects: items,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
        filters: {
          q,
          tags,
          owner,
          visibility,
          category,
          sortBy,
          sortOrder,
        }
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Projects GET error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch projects",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const isAllowed = await rateLimit(ip, "create_project", 10, 60 * 60 * 1000); // 10 projects per hour
    
    if (!isAllowed) {
      return NextResponse.json(
        { 
          success: false,
          error: "Too many project creation attempts. Please try again later.",
          retryAfter: 60 * 60 // 1 hour in seconds
        },
        { status: 429 }
      );
    }

    // Authentication check
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { 
          success: false,
          error: "Authentication required" 
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const parsed = createProjectSchema.safeParse(body);
    
    if (!parsed.success) {
      const formattedErrors = parsed.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }));
      
      return NextResponse.json(
        { 
          success: false,
          error: "Validation failed",
          details: formattedErrors
        },
        { status: 400 }
      );
    }

    const { title, description, tags, visibility, assets, category, readme, license, version } = parsed.data;

    // Verify user exists and is active
    const user = await prisma.user.findUnique({ 
      where: { id: session.user.id },
      select: { id: true, isActive: true, role: true }
    });
    
    if (!user || !user.isActive) {
      return NextResponse.json(
        { 
          success: false,
          error: "User account not found or inactive" 
        },
        { status: 401 }
      );
    }

    // Generate unique slug
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let slug = baseSlug;
    let counter = 1;
    
    while (await prisma.project.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create project with enhanced data
    const created = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          title: title.trim(),
          description: description.trim(),
          slug,
          visibility,
          category,
          readme,
          license,
          version: version || "1.0.0",
          ownerId: user.id,
        },
      });

      // Handle tags
      if (tags?.length) {
        const tagRows = await Promise.all(
          tags.map((tagName) => {
            const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            return tx.tag.upsert({
              where: { slug },
              update: { name: tagName },
              create: { 
                slug, 
                name: tagName,
                color: `#${Math.floor(Math.random()*16777215).toString(16)}` // Random color
              },
            });
          })
        );
        
        await tx.projectTag.createMany({
          data: tagRows.map((t) => ({ projectId: project.id, tagId: t.id })),
          skipDuplicates: true,
        });
      }

      // Handle assets
      if (assets?.length) {
        await tx.asset.createMany({
          data: assets.map((a, index) => ({ 
            ...a, 
            projectId: project.id,
            isPrimary: index === 0, // First asset is primary
          })),
        });
      }

      return project;
    });

    // Log successful project creation
    console.log(`New project created: ${created.id} by user ${user.id} at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      data: {
        id: created.id,
        slug: created.slug,
        title: created.title,
        visibility: created.visibility,
        createdAt: created.createdAt,
      },
      message: "Project created successfully"
    }, { status: 201 });

  } catch (error) {
    console.error("Project creation error:", error);
    
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create project. Please try again later.",
        code: "PROJECT_CREATION_ERROR"
      },
      { status: 500 }
    );
  }
}

