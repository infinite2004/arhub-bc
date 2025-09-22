import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const positiveIntFromString = z
  .string()
  .regex(/^\d+$/)
  .transform((v) => Number(v))
  .pipe(z.number().int().positive());

const searchSchema = z.object({
  q: z.string().max(200).optional(),
  category: z.string().max(64).optional(),
  tags: z.string().max(256).optional(),
  sortBy: z.enum(["relevance", "date", "popularity"]).optional(),
  dateRange: z.enum(["all", "week", "month", "year"]).optional(),
  page: positiveIntFromString.optional().default(1),
  limit: positiveIntFromString.optional().default(12),
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

    // Enforce sane pagination limits
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const safePage = Math.max(page, 1);

    // Build where clause
    const where: any = {
      visibility: "PUBLIC",
    };

    // Enhanced text search with better relevance scoring
    if (query) {
      const searchTerms = query.trim().split(/\s+/).filter(term => term.length > 0);
      
      if (searchTerms.length === 1) {
        // Single term search
        where.OR = [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { tags: { some: { tag: { name: { contains: query, mode: "insensitive" } } } } },
        ];
      } else {
        // Multi-term search - all terms must be found
        where.AND = searchTerms.map(term => ({
          OR: [
            { title: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
            { tags: { some: { tag: { name: { contains: term, mode: "insensitive" } } } } },
          ]
        }));
      }
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
    const skip = (safePage - 1) * safeLimit;

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
        take: safeLimit,
      }),
      prisma.project.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.max(1, Math.ceil(totalCount / safeLimit));
    const hasNextPage = safePage < totalPages;
    const hasPrevPage = safePage > 1;

    // Get enhanced search suggestions for autocomplete
    const [suggestions, popularTags] = await Promise.all([
      prisma.project.findMany({
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
        take: 8,
        orderBy: { downloads: { _count: "desc" } },
      }),
      prisma.tag.findMany({
        where: query ? {
          name: { contains: query, mode: "insensitive" }
        } : undefined,
        include: {
          _count: {
            select: { projects: true }
          }
        },
        orderBy: { projects: { _count: "desc" } },
        take: 5,
      })
    ]);

    const searchSuggestions = [
      ...new Set([
        ...suggestions.map(p => p.title),
        ...suggestions.flatMap(p => p.tags.map(t => t.tag.name)),
        ...popularTags.map(t => t.name)
      ])
    ].slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        projects,
        pagination: {
          page: safePage,
          limit: safeLimit,
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
