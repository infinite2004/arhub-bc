"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2, LucideIcon } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "error";
  className?: string;
  text?: string;
  showText?: boolean;
  icon?: LucideIcon;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

const variantClasses = {
  default: "text-gray-600 dark:text-gray-400",
  primary: "text-blue-600 dark:text-blue-400",
  secondary: "text-gray-600 dark:text-gray-400",
  success: "text-green-600 dark:text-green-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  error: "text-red-600 dark:text-red-400",
};

export function LoadingSpinner({
  size = "md",
  variant = "default",
  className,
  text = "Loading...",
  showText = false,
  icon: Icon = Loader2,
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex flex-col items-center space-y-2">
        <Icon
          className={cn(
            "animate-spin",
            sizeClasses[size],
            variantClasses[variant]
          )}
        />
        {showText && text && (
          <p className={cn("text-sm text-gray-600 dark:text-gray-400")}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
}

// Skeleton loading component
interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

export function Skeleton({
  className,
  width,
  height,
  rounded = true,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200 dark:bg-gray-700",
        rounded && "rounded",
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  );
}

// Content skeleton for different content types
export function ContentSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[160px]" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <ContentSkeleton />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex space-x-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-28" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>
      ))}
    </div>
  );
}

// Full page loading component
interface FullPageLoadingProps {
  text?: string;
  showSpinner?: boolean;
  className?: string;
}

export function FullPageLoading({
  text = "Loading...",
  showSpinner = true,
  className,
}: FullPageLoadingProps) {
  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900",
        className
      )}
    >
      <div className="text-center">
        {showSpinner && (
          <LoadingSpinner
            size="xl"
            variant="primary"
            className="mb-4"
            showText={false}
          />
        )}
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {text}
        </p>
      </div>
    </div>
  );
}

// Inline loading component
interface InlineLoadingProps {
  text?: string;
  size?: "sm" | "md";
  className?: string;
}

export function InlineLoading({
  text = "Loading...",
  size = "sm",
  className,
}: InlineLoadingProps) {
  return (
    <div className={cn("inline-flex items-center space-x-2", className)}>
      <LoadingSpinner size={size} showText={false} />
      <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>
    </div>
  );
}

// Button loading state
interface ButtonLoadingProps {
  children: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  className?: string;
}

export function ButtonLoading({
  children,
  loading = false,
  loadingText = "Loading...",
  className,
}: ButtonLoadingProps) {
  if (!loading) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span className={cn("inline-flex items-center space-x-2", className)}>
      <LoadingSpinner size="sm" showText={false} />
      <span>{loadingText}</span>
    </span>
  );
}
