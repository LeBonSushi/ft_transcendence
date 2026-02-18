"use client";

import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  ringColor?: string;
  pictureColor?: string;
}

const sizeClasses = {
  xs: "h-6 w-6 text-xs",
  sm: "h-9 w-9 text-sm",
  md: "h-12 w-12 text-base",
  lg: "h-16 w-16 text-xl sm:h-20 sm:w-20 sm:text-2xl",
  xl: "h-20 w-20 text-2xl sm:h-24 sm:w-24 sm:text-3xl",
};

export function Avatar({
  src,
  alt = "Avatar",
  fallback,
  size = "md",
  className,
  ringColor = "ring-border",
  pictureColor = "bg-primary",
}: AvatarProps) {
  const initial = fallback?.charAt(0)?.toUpperCase() || "?";

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center overflow-hidden ring-2 select-none",
        sizeClasses[size],
        ringColor,
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover block"
        />
      ) : (
        <div className={cn("h-full w-full select-none", pictureColor, "flex items-center justify-center text-primary-foreground font-semibold")}>
          {initial}
        </div>
      )}
    </div>
  );
}

// User avatar with optional online status
interface UserAvatarProps extends AvatarProps {
  isOnline?: boolean;
  showStatus?: boolean;
}

export function UserAvatar({
  isOnline,
  showStatus = false,
  ...props
}: UserAvatarProps) {
  return (
    <div className="relative">
      <Avatar {...props} />
      {showStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
            isOnline ? "bg-green-500" : "bg-gray-400"
          )}
        />
      )}
    </div>
  );
}
