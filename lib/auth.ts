import NextAuth, { NextAuthOptions, getServerSession as getSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { ExtendedUser, UserRole, AppError, AuthenticationError } from "@/types";

// Enhanced session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      role: UserRole;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

export const authOptions: NextAuthOptions = {
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { 
          label: "Email", 
          type: "email",
          placeholder: "Enter your email"
        },
        password: { 
          label: "Password", 
          type: "password",
          placeholder: "Enter your password"
        },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new AuthenticationError("Email and password are required");
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(credentials.email)) {
            throw new AuthenticationError("Invalid email format");
          }

          const user = await prisma.user.findUnique({ 
            where: { email: credentials.email.toLowerCase() },
            select: {
              id: true,
              email: true,
              password: true,
              name: true,
              image: true,
              role: true,
            }
          });

          if (!user) {
            throw new AuthenticationError("Invalid credentials");
          }

          if (!user.password) {
            throw new AuthenticationError("Account not properly configured");
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) {
            throw new AuthenticationError("Invalid credentials");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role as UserRole,
          };
        } catch (error) {
          if (error instanceof AppError) {
            throw error;
          }
          console.error("Authentication error:", error);
          throw new AuthenticationError("Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      // Handle session updates
      if (trigger === "update" && session) {
        if (session.user?.name) token.name = session.user.name;
        if (session.user?.image) token.picture = session.user.image;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET ?? "fallback-secret-for-development",
  debug: process.env.NODE_ENV === "development",
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // Log sign in events for analytics/auditing
      console.log(`User ${user.email} signed in via ${account?.provider}`);
    },
    async signOut({ session, token }) {
      // Log sign out events
      if (token?.email) {
        console.log(`User ${token.email} signed out`);
      }
    },
  },
};

export function getServerSession() {
  return getSession(authOptions);
}

// Enhanced authentication utilities
export class AuthService {
  static async validateUser(userId: string): Promise<ExtendedUser> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      if (!user) {
        throw new AuthenticationError("User not found");
      }

      return {
        ...user,
        role: user.role as UserRole,
        status: 'ACTIVE' as const, // Default status since it's not in schema
        projectsCount: 0,
        followersCount: 0,
        followingCount: 0,
      } as ExtendedUser;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AuthenticationError("Failed to validate user");
    }
  }

  static async hasPermission(userId: string, requiredRole: UserRole): Promise<boolean> {
    try {
      const user = await this.validateUser(userId);
      const roleHierarchy: Record<UserRole, number> = {
        'USER': 1,
        'MODERATOR': 2,
        'ADMIN': 3,
      };

      return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
    } catch (error) {
      return false;
    }
  }

  static async refreshUserSession(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { updatedAt: new Date() }
      });
    } catch (error) {
      console.error("Failed to refresh user session:", error);
    }
  }
}

