import { Download, FileText, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function SpecsTab() {
  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="flex flex-col gap-4 px-4 pb-4">
        <Button className="w-full bg-ai text-white hover:bg-ai/90">
          <Sparkles className="h-4 w-4" />
          Generate Spec
        </Button>

        <div className="rounded-2xl border border-surface-border bg-elevated p-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-subtle">
              <FileText className="h-4 w-4 text-ai-text" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-copy-primary">
                E-commerce Backend Spec
              </p>
              <p className="mt-1 line-clamp-3 text-xs text-copy-muted">
                Overview of services, data stores, and message flows for a
                scalable storefront: API gateway, catalog, orders, payments, and
                async fulfillment.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="mt-3 w-full border border-surface-border text-copy-muted"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}
