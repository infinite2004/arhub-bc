// Security utilities for input validation, sanitization, and rate limiting

import { z } from 'zod';
import { cache } from './cache';

// Input sanitization utilities
export class InputSanitizer {
  // Remove potentially dangerous HTML tags and attributes
  static sanitizeHtml(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/<link\b[^<]*>/gi, '')
      .replace(/<meta\b[^<]*>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '');
  }

  // Sanitize file names
  static sanitizeFileName(fileName: string): string {
    if (typeof fileName !== 'string') return 'unnamed';
    
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 255);
  }

  // Sanitize URLs
  static sanitizeUrl(url: string): string | null {
    if (typeof url !== 'string') return null;
    
    try {
      const parsed = new URL(url);
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return null;
      }
      
      return parsed.toString();
    } catch {
      return null;
    }
  }

  // Sanitize SQL input (basic protection)
  static sanitizeSql(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/['"]/g, '')
      .replace(/;/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
      .replace(/xp_/gi, '')
      .replace(/sp_/gi, '');
  }

  // Sanitize JSON input
  static sanitizeJson(input: any): any {
    if (typeof input === 'string') {
      try {
        const parsed = JSON.parse(input);
        return this.sanitizeJson(parsed);
      } catch {
        return null;
      }
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeJson(item));
    }
    
    if (input && typeof input === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        const sanitizedKey = this.sanitizeHtml(key);
        sanitized[sanitizedKey] = this.sanitizeJson(value);
      }
      return sanitized;
    }
    
    return input;
  }
}

// Rate limiting implementation
export class RateLimiter {
  private static instance: RateLimiter;
  private limits = new Map<string, { count: number; resetTime: number }>();

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  async checkLimit(
    identifier: string, 
    limit: number, 
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const key = `rate_limit:${identifier}`;
    
    // Try to get from cache first
    const cached = await cache.get<{ count: number; resetTime: number }>(key);
    
    let current = cached || { count: 0, resetTime: now + windowMs };
    
    // Reset if window has expired
    if (now > current.resetTime) {
      current = { count: 0, resetTime: now + windowMs };
    }
    
    // Check if limit exceeded
    const allowed = current.count < limit;
    
    if (allowed) {
      current.count++;
    }
    
    // Cache the updated state
    const ttl = Math.ceil((current.resetTime - now) / 1000);
    await cache.set(key, current, { ttl });
    
    return {
      allowed,
      remaining: Math.max(0, limit - current.count),
      resetTime: current.resetTime
    };
  }

  async resetLimit(identifier: string): Promise<void> {
    const key = `rate_limit:${identifier}`;
    await cache.delete(key);
  }
}

// Security headers configuration
export const securityHeaders = {
  // Content Security Policy
  csp: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'", 'data:'],
    'connect-src': ["'self'"],
    'media-src': ["'self'"],
    'object-src': ["'none'"],
    'child-src': ["'self'"],
    'frame-ancestors': ["'none'"],
    'form-action': ["'self'"],
    'base-uri': ["'self'"],
    'manifest-src': ["'self'"]
  },

  // Other security headers
  headers: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin'
  }
};

// Input validation schemas
export const validationSchemas = {
  // User input validation
  user: z.object({
    name: z.string().min(1).max(100).transform(InputSanitizer.sanitizeHtml),
    email: z.string().email().toLowerCase(),
    password: z.string().min(8).max(128),
    bio: z.string().max(500).optional().transform(val => 
      val ? InputSanitizer.sanitizeHtml(val) : undefined
    )
  }),

  // Project validation
  project: z.object({
    title: z.string().min(1).max(120).transform(InputSanitizer.sanitizeHtml),
    description: z.string().min(10).max(200).transform(InputSanitizer.sanitizeHtml),
    tags: z.array(z.string().max(50)).max(10),
    visibility: z.enum(['PUBLIC', 'UNLISTED', 'PRIVATE'])
  }),

  // File upload validation
  fileUpload: z.object({
    name: z.string().transform(InputSanitizer.sanitizeFileName),
    size: z.number().min(1).max(100 * 1024 * 1024), // 100MB max
    type: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/)
  }),

  // API request validation
  apiRequest: z.object({
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    path: z.string().regex(/^\/[a-zA-Z0-9\/\-_]*$/),
    body: z.any().optional()
  })
};

// Security middleware for Next.js API routes
export function withSecurity(handler: any) {
  return async (req: any, res: any) => {
    // Set security headers
    Object.entries(securityHeaders.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Set CSP header
    const cspString = Object.entries(securityHeaders.csp)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');
    res.setHeader('Content-Security-Policy', cspString);

    // Rate limiting
    const rateLimiter = RateLimiter.getInstance();
    const clientId = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    
    const rateLimit = await rateLimiter.checkLimit(
      `api:${clientId}`,
      100, // 100 requests
      60 * 1000 // per minute
    );

    if (!rateLimit.allowed) {
      res.setHeader('X-RateLimit-Limit', '100');
      res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString());
      res.setHeader('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString());
      
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      });
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', '100');
    res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString());
    res.setHeader('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString());

    // Input validation
    try {
      if (req.body && typeof req.body === 'object') {
        req.body = InputSanitizer.sanitizeJson(req.body);
      }
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Request body contains invalid data'
      });
    }

    return handler(req, res);
  };
}

// Password security utilities
export class PasswordSecurity {
  // Check password strength
  static checkStrength(password: string): {
    score: number;
    feedback: string[];
    isStrong: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) score += 1;
    else feedback.push('Password should be at least 8 characters long');

    if (password.length >= 12) score += 1;
    else feedback.push('Consider using 12+ characters for better security');

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Add uppercase letters');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Add numbers');

    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else feedback.push('Add special characters');

    // Common patterns check
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /abc123/i,
      /admin/i
    ];

    if (commonPatterns.some(pattern => pattern.test(password))) {
      score = Math.max(0, score - 2);
      feedback.push('Avoid common patterns and dictionary words');
    }

    return {
      score,
      feedback,
      isStrong: score >= 4
    };
  }

  // Generate secure random password
  static generatePassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }
}

// CSRF protection
export class CSRFProtection {
  private static tokens = new Map<string, { token: string; expires: number }>();

  static generateToken(sessionId: string): string {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expires = Date.now() + (60 * 60 * 1000); // 1 hour
    
    this.tokens.set(sessionId, { token, expires });
    
    return token;
  }

  static validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId);
    
    if (!stored || stored.expires < Date.now()) {
      this.tokens.delete(sessionId);
      return false;
    }
    
    return stored.token === token;
  }

  static cleanup(): void {
    const now = Date.now();
    for (const [sessionId, data] of this.tokens.entries()) {
      if (data.expires < now) {
        this.tokens.delete(sessionId);
      }
    }
  }
}

// Security audit utilities
export class SecurityAudit {
  static async auditRequest(req: any): Promise<{
    risk: 'low' | 'medium' | 'high';
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for suspicious headers
    const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip', 'x-cluster-client-ip'];
    const hasSuspiciousHeaders = suspiciousHeaders.some(header => 
      req.headers[header] && !this.isValidIP(req.headers[header])
    );

    if (hasSuspiciousHeaders) {
      issues.push('Suspicious IP headers detected');
      recommendations.push('Implement proper IP validation and rate limiting');
    }

    // Check for SQL injection patterns
    const bodyString = JSON.stringify(req.body || {});
    const sqlPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /insert\s+into/i,
      /delete\s+from/i,
      /update\s+set/i
    ];

    if (sqlPatterns.some(pattern => pattern.test(bodyString))) {
      issues.push('Potential SQL injection attempt detected');
      recommendations.push('Implement parameterized queries and input validation');
    }

    // Check for XSS patterns
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i
    ];

    if (xssPatterns.some(pattern => pattern.test(bodyString))) {
      issues.push('Potential XSS attempt detected');
      recommendations.push('Implement proper input sanitization and CSP headers');
    }

    // Determine risk level
    let risk: 'low' | 'medium' | 'high' = 'low';
    if (issues.length > 2) risk = 'high';
    else if (issues.length > 0) risk = 'medium';

    return { risk, issues, recommendations };
  }

  private static isValidIP(ip: string): boolean {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }
}

// Simple rate limiting function for API routes
export async function rateLimit(
  identifier: string,
  action: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const rateLimiter = RateLimiter.getInstance();
  const result = await rateLimiter.checkLimit(
    `${action}:${identifier}`,
    limit,
    windowMs
  );
  return result.allowed;
}

// Export utilities
export { RateLimiter, InputSanitizer, PasswordSecurity, CSRFProtection, SecurityAudit };

