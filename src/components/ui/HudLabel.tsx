import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface HudLabelProps extends HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function HudLabel({ className, children, ...rest }: HudLabelProps) {
  return (
    <span
      {...rest}
      className={cn(
        "font-mono text-[10px] uppercase tracking-hud text-slate",
        className
      )}
    >
      {children}
    </span>
  );
}
