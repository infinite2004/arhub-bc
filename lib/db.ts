import { PrismaClient } from "@prisma/client";
import { AppError } from "@/types";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

class DatabaseManager {
  private static instance: DatabaseManager;
  private client: PrismaClient;

  private constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is required");
    }

    this.client = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn", "query"] : ["error"],
      errorFormat: "pretty",
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });

    // Graceful shutdown
    process.on("beforeExit", async () => {
      await this.client.$disconnect();
    });

    process.on("SIGINT", async () => {
      await this.client.$disconnect();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      await this.client.$disconnect();
      process.exit(0);
    });
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public getClient(): PrismaClient {
    return this.client;
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error("Database health check failed:", error);
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    await this.client.$disconnect();
  }
}

// Development environment: use global instance to prevent multiple connections
export const prisma: PrismaClient =
  process.env.NODE_ENV === "development"
    ? global.prismaGlobal ?? DatabaseManager.getInstance().getClient()
    : DatabaseManager.getInstance().getClient();

if (process.env.NODE_ENV === "development") {
  global.prismaGlobal = prisma;
}

// Enhanced database utilities
export class DatabaseService {
  static async transaction<T>(
    fn: (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => Promise<T>,
    options?: { maxWait?: number; timeout?: number }
  ): Promise<T> {
    try {
      return await prisma.$transaction(fn, options);
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Transaction failed: ${error.message}`, 500, "TRANSACTION_ERROR");
      }
      throw new AppError("Transaction failed", 500, "TRANSACTION_ERROR");
    }
  }

  static async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    throw new AppError(
      `Operation failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`,
      500,
      "RETRY_FAILED"
    );
  }
}

// Export the database manager for advanced usage
export const dbManager = DatabaseManager.getInstance();

// Health check utility
export async function checkDatabaseHealth(): Promise<{ healthy: boolean; message: string }> {
  try {
    const isHealthy = await dbManager.healthCheck();
    return {
      healthy: isHealthy,
      message: isHealthy ? "Database is healthy" : "Database health check failed"
    };
  } catch (error) {
    return {
      healthy: false,
      message: `Database health check error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

