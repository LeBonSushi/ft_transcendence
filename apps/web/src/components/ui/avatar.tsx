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

// Palette de couleurs lisibles en light et dark
const AVATAR_COLORS: [string, string][] = [
  ["#e07b54", "#fff"],
  ["#d4956a", "#fff"],
  ["#c47a3f", "#fff"],
  ["#a85c3a", "#fff"],
  ["#7c9e6f", "#fff"],
  ["#5b8c72", "#fff"],
  ["#4a7fa8", "#fff"],
  ["#5b6fa8", "#fff"],
  ["#7c6db0", "#fff"],
  ["#a06090", "#fff"],
  ["#c0607a", "#fff"],
  ["#7a8c6a", "#fff"],
];

function getAvatarColor(str: string | undefined): [string, string] {
  if (!str) return AVATAR_COLORS[0];
  const sum = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export function Avatar({
  src,
  alt = "Avatar",
  fallback,
  size = "md",
  className,
  ringColor = "ring-border",
  pictureColor,
}: AvatarProps) {
  const initial = fallback?.charAt(0)?.toUpperCase() || "?";
  const [bg, fg] = pictureColor ? [pictureColor, "#fff"] : getAvatarColor(fallback);

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
        <div
          className="h-full w-full flex items-center justify-center font-semibold select-none"
          style={{ backgroundColor: bg, color: fg }}
        >
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
