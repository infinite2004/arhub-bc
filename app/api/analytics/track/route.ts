import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/security";
import { z } from "zod";

const analyticsEventSchema = z.object({
  name: z.string().min(1).max(100),
  properties: z.record(z.any()).optional(),
  timestamp: z.string().optional(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  url: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limiting for analytics
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const isAllowed = await rateLimit(ip, "analytics", 1000, 60 * 1000); // 1000 events per minute
    
    if (!isAllowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const event = analyticsEventSchema.parse(body);

    // Store analytics event in database
    await prisma.analyticsEvent.create({
      data: {
        name: event.name,
        properties: event.properties || {},
        sessionId: event.sessionId || 'unknown',
        userId: event.userId,
        url: event.url,
        timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
        ipAddress: ip,
        userAgent: req.headers.get("user-agent") || '',
      },
    });

    // Track specific events for insights
    if (event.name === 'page_view') {
      await trackPageView(event);
    } else if (event.name === 'project_interaction') {
      await trackProjectInteraction(event);
    } else if (event.name === 'search') {
      await trackSearch(event);
    } else if (event.name === 'file_upload') {
      await trackFileUpload(event);
    } else if (event.name === 'error') {
      await trackError(event);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Analytics tracking error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid analytics data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to track event" },
      { status: 500 }
    );
  }
}

async function trackPageView(event: any) {
  try {
    const url = new URL(event.url || '');
    const path = url.pathname;
    
    // Update page view count
    await prisma.pageView.upsert({
      where: { path },
      update: { count: { increment: 1 } },
      create: { path, count: 1 },
    });
  } catch (error) {
    console.warn("Failed to track page view:", error);
  }
}

async function trackProjectInteraction(event: any) {
  try {
    const { projectId, action } = event.properties || {};
    
    if (projectId && action) {
      // Update project interaction count
      await prisma.projectInteraction.upsert({
        where: { 
          projectId_action: { 
            projectId, 
            action 
          } 
        },
        update: { count: { increment: 1 } },
        create: { 
          projectId, 
          action, 
          count: 1 
        },
      });
    }
  } catch (error) {
    console.warn("Failed to track project interaction:", error);
  }
}

async function trackSearch(event: any) {
  try {
    const { query, resultsCount } = event.properties || {};
    
    if (query) {
      // Store search query for analytics
      await prisma.searchQuery.create({
        data: {
          query: query.substring(0, 255), // Limit length
          resultsCount: resultsCount || 0,
          timestamp: new Date(),
        },
      });
    }
  } catch (error) {
    console.warn("Failed to track search:", error);
  }
}

async function trackFileUpload(event: any) {
  try {
    const { fileName, fileSize, fileType, success } = event.properties || {};
    
    if (fileName) {
      // Store upload statistics
      await prisma.uploadStats.create({
        data: {
          fileName: fileName.substring(0, 255),
          fileSize: fileSize || 0,
          fileType: fileType || 'unknown',
          success: success || false,
          timestamp: new Date(),
        },
      });
    }
  } catch (error) {
    console.warn("Failed to track file upload:", error);
  }
}

async function trackError(event: any) {
  try {
    const { error, context } = event.properties || {};
    
    if (error) {
      // Store error for monitoring
      await prisma.errorLog.create({
        data: {
          error: error.substring(0, 500),
          context: context || 'unknown',
          timestamp: new Date(),
          url: event.url,
          userAgent: event.properties?.userAgent || '',
        },
      });
    }
  } catch (error) {
    console.warn("Failed to track error:", error);
  }
}
