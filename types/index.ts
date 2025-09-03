import { User, Project, Asset, Comment, Like } from '@prisma/client';
import { z } from 'zod';

// Base types
export type BaseEntity = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

// User types
export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface ExtendedUser extends Omit<User, 'password'> {
  role: UserRole;
  status: UserStatus;
  projectsCount?: number;
  followersCount?: number;
  followingCount?: number;
}

// Project types
export type ProjectVisibility = 'PUBLIC' | 'UNLISTED' | 'PRIVATE';
export type ProjectStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface ExtendedProject extends Project {
  author: ExtendedUser;
  assets: Asset[];
  likes: Like[];
  comments: Comment[];
  tags: string[];
  _count?: {
    likes: number;
    comments: number;
    downloads: number;
  };
}

// Asset types
export type AssetKind = 'MODEL' | 'SCRIPT' | 'CONFIG' | 'PREVIEW' | 'TEXTURE' | 'MATERIAL';
export type AssetStatus = 'PROCESSING' | 'READY' | 'ERROR';

export interface ExtendedAsset extends Asset {
  project: Project;
  metadata?: Record<string, any>;
}

// Form schemas
export const userProfileSchema = z.object({
  name: z.string().min(2).max(100),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional(),
  location: z.string().max(100).optional(),
  socialLinks: z.object({
    twitter: z.string().url().optional(),
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
  }).optional(),
});

export const projectSearchSchema = z.object({
  query: z.string().min(1).max(100),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  sortBy: z.enum(['newest', 'oldest', 'popular', 'rating']).default('newest'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
});

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error types
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string[]>) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface AsyncState<T> extends LoadingState {
  data: T | null;
}

// Event types
export interface AppEvent {
  type: string;
  payload: any;
  timestamp: Date;
  userId?: string;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';
export type ColorScheme = 'light' | 'dark';

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  validation?: any;
}

// Export all Prisma types for convenience
export type { User, Project, Asset, Comment, Like };
export type { z };
