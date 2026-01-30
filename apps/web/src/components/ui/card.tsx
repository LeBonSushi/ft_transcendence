"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

// Base Card component
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined" | "danger";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl",
          {
            "bg-card border border-border": variant === "default",
            "bg-card border border-border shadow-lg": variant === "elevated",
            "bg-transparent border border-border": variant === "outlined",
            "bg-destructive/5 border border-destructive/20": variant === "danger",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4 sm:p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-base sm:text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs sm:text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 sm:p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 sm:p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// Section Card - Card with icon title for profile sections
interface SectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  icon?: LucideIcon;
  iconClassName?: string;
  variant?: "default" | "danger";
  description?: string;
}

const SectionCard = React.forwardRef<HTMLDivElement, SectionCardProps>(
  ({ title, icon: Icon, iconClassName, variant = "default", description, children, className, ...props }, ref) => {
    const isDanger = variant === "danger";

    return (
      <Card
        ref={ref}
        variant={isDanger ? "danger" : "default"}
        className={cn("p-4 sm:p-6", className)}
        {...props}
      >
        <h2 className={cn(
          "text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2",
          isDanger ? "text-destructive" : "text-foreground"
        )}>
          {Icon && <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", isDanger ? "text-destructive" : "text-primary", iconClassName)} />}
          {title}
        </h2>
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
            {description}
          </p>
        )}
        {children}
      </Card>
    );
  }
);
SectionCard.displayName = "SectionCard";

// Info Row - Display label/value pairs
interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

function InfoRow({ label, value, className }: InfoRowProps) {
  return (
    <div className={cn("flex items-center justify-between py-2 border-b border-border last:border-0", className)}>
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="font-medium text-foreground text-sm">{value}</span>
    </div>
  );
}

// List Item with icon
interface ListItemProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  highlight?: boolean;
}

function ListItem({ icon, title, description, action, className, highlight }: ListItemProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg",
        highlight ? "bg-primary/5 border border-primary/20" : "bg-muted/50",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2 rounded-lg bg-muted shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="font-medium text-foreground text-sm sm:text-base">{title}</div>
          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex justify-end sm:justify-start shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  SectionCard,
  InfoRow,
  ListItem,
};
