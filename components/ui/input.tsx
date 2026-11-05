import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border border-surface-border-subtle bg-elevated text-copy-primary caret-brand px-3 py-1 text-base transition-colors outline-none [&:-webkit-autofill]:[-webkit-text-fill-color:var(--text-primary)] [&:-webkit-autofill]:shadow-[inset_0_0_0_100px_var(--bg-elevated)] file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-copy-primary placeholder:text-copy-faint focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-elevated disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-elevated dark:disabled:bg-elevated dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
