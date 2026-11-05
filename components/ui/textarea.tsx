import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-xl border border-surface-border-subtle bg-elevated text-copy-primary caret-brand px-3 py-2 text-base transition-colors outline-none [&:-webkit-autofill]:[-webkit-text-fill-color:var(--text-primary)] [&:-webkit-autofill]:shadow-[inset_0_0_0_100px_var(--bg-elevated)] placeholder:text-copy-faint focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-elevated disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-elevated dark:disabled:bg-elevated dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
