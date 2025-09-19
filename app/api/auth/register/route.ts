import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { rateLimit } from "@/lib/security";

const registerSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const isAllowed = await rateLimit(ip, "register", 5, 15 * 60 * 1000); // 5 attempts per 15 minutes
    
    if (!isAllowed) {
      return NextResponse.json(
        { 
          error: "Too many registration attempts. Please try again later.",
          retryAfter: 15 * 60 // 15 minutes in seconds
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password, name } = registerSchema.parse(body);

    // Additional security checks
    const emailDomain = email.split('@')[1];
    const blockedDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
    if (blockedDomains.includes(emailDomain)) {
      return NextResponse.json(
        { error: "Please use a valid email address" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password with higher salt rounds for better security
    const hashedPassword = await bcrypt.hash(password, 14);

    // Create user with additional security measures
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name.trim(),
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
    });

    // Log successful registration for security monitoring
    console.log(`New user registered: ${email} at ${new Date().toISOString()}`);

    return NextResponse.json(
      { 
        success: true,
        message: "Account created successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }));
      
      return NextResponse.json(
        { 
          error: "Validation failed",
          details: formattedErrors
        },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    
    // Don't expose internal errors to client
    return NextResponse.json(
      { 
        error: "Registration failed. Please try again later.",
        code: "REGISTRATION_ERROR"
      },
      { status: 500 }
    );
  }
}
