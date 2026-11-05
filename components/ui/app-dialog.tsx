import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type DialogTone = "default" | "danger";

interface AppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Optional icon shown in a badge beside the title. */
  icon?: LucideIcon;
  /** `danger` tints the icon badge with the error color. */
  tone?: DialogTone;
  children?: ReactNode;
  /** Footer actions, typically `Button`s. Footer is omitted when absent. */
  footer?: ReactNode;
  className?: string;
}

const TONE_CLASSES: Record<DialogTone, string> = {
  default: "bg-accent-dim text-brand",
  danger: "bg-state-error/15 text-state-error",
};

/**
 * Shared dialog shell styled with the app color tokens: icon badge, title,
 * optional description, body content, and footer actions.
 */
export function AppDialog({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  tone = "default",
  children,
  footer,
  className,
}: AppDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "gap-5 rounded-3xl border border-surface-border bg-surface p-6 text-copy-primary shadow-2xl ring-0 sm:max-w-md",
          className,
        )}
      >
        <DialogHeader className="flex-row items-start gap-3 pr-8">
          {Icon && (
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                TONE_CLASSES[tone],
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <DialogTitle className="text-base leading-snug font-semibold text-copy-primary">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-sm text-copy-muted">
                {description}
              </DialogDescription>
            )}
          </div>
        </DialogHeader>
        {children}
        {footer && (
          <DialogFooter className="-mx-6 -mb-6 rounded-b-3xl border-surface-border bg-elevated px-6 py-4">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
