"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";

import { cn } from "@/lib/utils";

function TooltipProvider({ ...props }: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider delay={300} {...props} />;
}

interface TooltipProps {
  /** Tooltip text. */
  content: React.ReactNode;
  /** The single interactive element that triggers the tooltip. */
  children: React.ReactElement<Record<string, unknown>>;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

/** Themed tooltip: wraps one trigger element and shows `content` on hover/focus. */
function Tooltip({
  content,
  children,
  side = "bottom",
  className,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger render={children} />
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Positioner
          side={side}
          sideOffset={8}
          className="z-[70]"
        >
          <TooltipPrimitive.Popup
            className={cn(
              "rounded-xl border border-surface-border-subtle bg-elevated px-2.5 py-1.5 text-xs font-medium text-copy-primary shadow-lg transition-opacity duration-100 data-ending-style:opacity-0 data-starting-style:opacity-0",
              className,
            )}
          >
            {content}
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

export { Tooltip, TooltipProvider };
