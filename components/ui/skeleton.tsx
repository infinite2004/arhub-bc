import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Specific skeleton components for common use cases
function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="space-y-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-20 w-full" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  )
}

function SkeletonAvatar({ size = "default" }: { size?: "sm" | "default" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    default: "h-10 w-10",
    lg: "h-12 w-12"
  }
  
  return (
    <Skeleton className={cn("rounded-full", sizeClasses[size])} />
  )
}

function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )} 
        />
      ))}
    </div>
  )
}

function SkeletonButton({ size = "default" }: { size?: "sm" | "default" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-16",
    default: "h-10 w-20",
    lg: "h-12 w-24"
  }
  
  return <Skeleton className={cn("rounded-md", sizeClasses[size])} />
}

function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

function SkeletonList({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <SkeletonAvatar size="sm" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

function SkeletonForm() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="flex space-x-2">
        <SkeletonButton />
        <SkeletonButton />
      </div>
    </div>
  )
}

function SkeletonImage({ aspectRatio = "square" }: { aspectRatio?: "square" | "video" | "wide" }) {
  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[16/9]"
  }
  
  return <Skeleton className={cn("w-full", aspectClasses[aspectRatio])} />
}

function SkeletonGrid({ items = 6, columns = 3 }: { items?: number; columns?: number }) {
  return (
    <div className={cn("grid gap-4", `grid-cols-${columns}`)}>
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

// Loading spinner component
function LoadingSpinner({ size = "default" }: { size?: "sm" | "default" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8"
  }
  
  return (
    <div className={cn("animate-spin rounded-full border-2 border-muted border-t-primary", sizeClasses[size])} />
  )
}

// Loading overlay
function LoadingOverlay({ children, isLoading, message = "Loading..." }: { 
  children: React.ReactNode
  isLoading: boolean
  message?: string 
}) {
  if (!isLoading) return <>{children}</>
  
  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center space-y-2">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  )
}

// Progressive loading component
function ProgressiveLoader({ 
  stages, 
  currentStage, 
  onComplete 
}: { 
  stages: string[]
  currentStage: number
  onComplete?: () => void 
}) {
  const progress = ((currentStage + 1) / stages.length) * 100
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        {stages.map((stage, index) => (
          <div 
            key={index}
            className={cn(
              "flex items-center space-x-2 text-sm",
              index <= currentStage ? "text-primary" : "text-muted-foreground"
            )}
          >
            <div className={cn(
              "h-2 w-2 rounded-full",
              index <= currentStage ? "bg-primary" : "bg-muted"
            )} />
            <span>{stage}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export {
  Skeleton,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonText,
  SkeletonButton,
  SkeletonTable,
  SkeletonList,
  SkeletonForm,
  SkeletonImage,
  SkeletonGrid,
  LoadingSpinner,
  LoadingOverlay,
  ProgressiveLoader
}

