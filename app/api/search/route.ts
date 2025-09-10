import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  sortBy: z.enum(["relevance", "date", "popularity"]).optional(),
  dateRange: z.enum(["all", "week", "month", "year"]).optional(),
  page: z.string().transform(Number).optional().default(1),
  limit: z.string().transform(Number).optional().default(12),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    const {
      q: query,
      category,
      tags,
      sortBy = "relevance",
      dateRange = "all",
      page,
      limit,
    } = searchSchema.parse(params);

    // Build where clause
    const where: any = {
      visibility: "PUBLIC",
    };

    // Text search
    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { tags: { some: { tag: { name: { contains: query, mode: "insensitive" } } } } },
      ];
    }

    // Category filter
    if (category) {
      where.category = category;
    }

    // Tags filter
    if (tags) {
      const tagArray = tags.split(",").map(tag => tag.trim());
      where.tags = {
        some: {
          tag: {
            name: { in: tagArray }
          }
        }
      };
    }

    // Date range filter
    if (dateRange !== "all") {
      const now = new Date();
      let dateFilter: Date;

      switch (dateRange) {
        case "week":
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "year":
          dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFilter = new Date(0);
      }

      where.createdAt = { gte: dateFilter };
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (sortBy) {
      case "date":
        orderBy = { createdAt: "desc" };
        break;
      case "popularity":
        orderBy = { downloads: { _count: "desc" } };
        break;
      case "relevance":
      default:
        // For relevance, we'll use a combination of factors
        // This is a simplified approach - in production you might want to use full-text search
        orderBy = [
          { downloads: { _count: "desc" } },
          { createdAt: "desc" }
        ];
        break;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute search
    const [projects, totalCount] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, image: true } },
          tags: { include: { tag: true } },
          assets: true,
          downloads: true,
          _count: {
            select: {
              downloads: true,
              assets: true,
            }
          }
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Get search suggestions for autocomplete
    const suggestions = await prisma.project.findMany({
      where: {
        visibility: "PUBLIC",
        OR: query ? [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ] : undefined,
      },
      select: {
        title: true,
        tags: { include: { tag: true } },
      },
      take: 5,
    });

    const searchSuggestions = [
      ...new Set([
        ...suggestions.map(p => p.title),
        ...suggestions.flatMap(p => p.tags.map(t => t.tag.name))
      ])
    ].slice(0, 8);

    return NextResponse.json({
      success: true,
      data: {
        projects,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
        suggestions: searchSuggestions,
        filters: {
          query,
          category,
          tags: tags ? tags.split(",").map(tag => tag.trim()) : [],
          sortBy,
          dateRange,
        }
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Search error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid search parameters",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
