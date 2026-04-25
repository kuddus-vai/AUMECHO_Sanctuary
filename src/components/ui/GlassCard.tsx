import { cn } from "@/lib/utils";
import { forwardRef, type HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, glow, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        {...rest}
        className={cn(
          "relative rounded-xl backdrop-blur-glass",
          "border border-[rgba(255,255,255,0.07)]",
          "bg-[rgba(10,10,15,0.55)]",
          "shadow-inset-border",
          "transition-[border-color,box-shadow] duration-[400ms] ease-out",
          glow && "hover:border-[rgba(0,242,255,0.25)] hover:shadow-glow-sm",
          className
        )}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";
