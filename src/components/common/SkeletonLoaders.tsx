import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  variant?: "card" | "text" | "avatar" | "button" | "image";
  className?: string;
  count?: number;
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("glass-card rounded-2xl p-6 space-y-4", className)}>
      <Skeleton className="h-12 w-12 rounded-xl" />
      <Skeleton className="h-5 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: `${100 - i * 10}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return <Skeleton className={cn("rounded-full", sizeClasses[size])} />;
}

export function SkeletonButton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-10 w-32 rounded-lg", className)} />;
}

export function SkeletonImage({ aspectRatio = "video", className }: { aspectRatio?: "square" | "video" | "wide"; className?: string }) {
  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[21/9]",
  };

  return <Skeleton className={cn("w-full rounded-xl", aspectClasses[aspectRatio], className)} />;
}

export function SkeletonLoader({ variant = "card", className, count = 1 }: SkeletonLoaderProps) {
  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, i) => {
        switch (variant) {
          case "card":
            return <SkeletonCard key={i} className={className} />;
          case "text":
            return <SkeletonText key={i} className={className} />;
          case "avatar":
            return <SkeletonAvatar key={i} />;
          case "button":
            return <SkeletonButton key={i} className={className} />;
          case "image":
            return <SkeletonImage key={i} className={className} />;
          default:
            return <SkeletonCard key={i} className={className} />;
        }
      })}
    </>
  );
}

// Dashboard specific skeletons
export function DashboardCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

export function GeneratedContentSkeleton() {
  return (
    <div className="glass-card rounded-xl p-5 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 py-3">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  );
}
