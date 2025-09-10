import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");
    const width = parseInt(searchParams.get("w") || "800");
    const quality = parseInt(searchParams.get("q") || "75");

    if (!imageUrl) {
      return new NextResponse("Missing image URL", { status: 400 });
    }

    // Validate URL
    try {
      new URL(imageUrl);
    } catch {
      return new NextResponse("Invalid image URL", { status: 400 });
    }

    // Fetch the original image
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "ARHub-ImageOptimizer/1.0",
      },
    });

    if (!response.ok) {
      return new NextResponse("Failed to fetch image", { status: 404 });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    // For now, we'll return the original image
    // In production, you'd want to use a service like Sharp or Cloudinary
    // to actually optimize the image based on width and quality parameters

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": imageBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("Image optimization error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
