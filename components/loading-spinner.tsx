"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
  variant?: "default" | "dots" | "pulse" | "bars";
}

export function LoadingSpinner({
  size = "md",
  className,
  text,
  variant = "default",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  const renderSpinner = () => {
    switch (variant) {
      case "dots":
        return (
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
          </div>
        );
      case "pulse":
        return (
          <div className="w-full h-full bg-current rounded-full animate-pulse"></div>
        );
      case "bars":
        return (
          <div className="flex space-x-1">
            <div className="w-1 h-full bg-current animate-pulse [animation-delay:-0.3s]"></div>
            <div className="w-1 h-full bg-current animate-pulse [animation-delay:-0.2s]"></div>
            <div className="w-1 h-full bg-current animate-pulse [animation-delay:-0.1s]"></div>
            <div className="w-1 h-full bg-current animate-pulse"></div>
          </div>
        );
      default:
        return (
          <svg
            className={cn("animate-spin", sizeClasses[size])}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        );
    }
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex flex-col items-center space-y-2">
        <div className="text-blue-600 dark:text-blue-400">
          {renderSpinner()}
        </div>
        {text && (
          <p className={cn("text-gray-600 dark:text-gray-300", textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
}

// Loading overlay component
interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  className?: string;
}

export function LoadingOverlay({
  isLoading,
  children,
  message = "Loading...",
  className,
}: LoadingOverlayProps) {
  if (!isLoading) return <>{children}</>;

  return (
    <div className={cn("relative", className)}>
      {children}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10">
        <LoadingSpinner size="lg" text={message} />
      </div>
    </div>
  );
}

// Progressive loading component
interface ProgressiveLoaderProps {
  stages: string[];
  currentStage: number;
  className?: string;
}

export function ProgressiveLoader({
  stages,
  currentStage,
  className,
}: ProgressiveLoaderProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {stages[currentStage]}
        </h3>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStage + 1) / stages.length) * 100}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          Step {currentStage + 1} of {stages.length}
        </p>
      </div>
    </div>
  );
}

// Skeleton loading components
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700",
        className
      )}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="space-y-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-20 w-full" />
        <div className="flex space-x-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}