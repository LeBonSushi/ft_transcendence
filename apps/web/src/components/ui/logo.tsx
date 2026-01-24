"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "white";
  showText?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: {
    container: "w-8 h-8",
    icon: "w-5 h-5",
    text: "text-lg",
  },
  md: {
    container: "w-10 h-10",
    icon: "w-6 h-6",
    text: "text-xl",
  },
  lg: {
    container: "w-12 h-12",
    icon: "w-7 h-7",
    text: "text-2xl",
  },
};

export function Logo({
  size = "md",
  variant = "default",
  showText = true,
  className
}: LogoProps) {
  const config = sizeConfig[size];
  const isWhite = variant === "white";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          config.container,
          "rounded-full flex items-center justify-center",
          isWhite
            ? "bg-white/20 backdrop-blur-sm"
            : "rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25"
        )}
      >
        <svg
          className={cn(config.icon, isWhite ? "text-white" : "text-white")}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM4 12C4 11.39 4.08 10.79 4.21 10.22L8 14V15C8 16.1 8.9 17 10 17V19.93C6.61 19.44 4 16.07 4 12ZM17.89 17.4C17.64 16.59 16.9 16 16 16H15V13C15 12.45 14.55 12 14 12H8V10H10C10.55 10 11 9.55 11 9V7H13C14.1 7 15 6.1 15 5V4.59C17.93 5.78 20 8.65 20 12C20 14.08 19.19 15.98 17.89 17.4Z"/>
        </svg>
      </div>
      {showText && (
        <span
          className={cn(
            "font-serif tracking-wide",
            config.text,
            isWhite ? "text-white" : "text-foreground"
          )}
        >
          Voyageur
        </span>
      )}
    </div>
  );
}
