"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Check, Copy, Loader2, Share2, UserPlus, Users, X } from "lucide-react";

import { AppDialog } from "@/components/ui/app-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Collaborator, ProjectRole } from "@/lib/projects";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  role: ProjectRole;
}

async function readError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? "Something went wrong";
  } catch {
    return "Something went wrong";
  }
}

function CollaboratorRow({
  collaborator,
  canRemove,
  isRemoving,
  onRemove,
}: {
  collaborator: Collaborator;
  canRemove: boolean;
  isRemoving: boolean;
  onRemove: (collaborator: Collaborator) => void;
}) {
  const label = collaborator.name ?? collaborator.email;

  return (
    <li className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-elevated">
      {collaborator.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={collaborator.imageUrl}
          alt=""
          className="h-8 w-8 shrink-0 rounded-full"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-subtle text-xs font-medium uppercase text-copy-secondary"
        >
          {label.charAt(0)}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-copy-primary">{label}</p>
        {collaborator.name && (
          <p className="truncate text-xs text-copy-muted">
            {collaborator.email}
          </p>
        )}
      </div>
      {canRemove && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onRemove(collaborator)}
          disabled={isRemoving}
          aria-label={`Remove ${label}`}
          className="text-copy-muted hover:text-state-error"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </li>
  );
}

export function ShareDialog({
  open,
  onOpenChange,
  projectId,
  role,
}: ShareDialogProps) {
  const isOwner = role === "owner";
  const baseUrl = `/api/projects/${projectId}/collaborators`;

  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    

    (async () => {
      try {
        const response = await fetch(baseUrl);
        if (cancelled) return;
        if (!response.ok) {
          setError(await readError(response));
          return;
        }
        const data = (await response.json()) as {
          collaborators: Collaborator[];
        };
        if (cancelled) return;
        setError(null);
        setCollaborators(data.collaborators);
      } catch {
        if (!cancelled) setError("Could not load collaborators");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, baseUrl]);

  const handleInvite = async (event: FormEvent) => {
    event.preventDefault();
    const value = email.trim();
    if (!value || isInviting) return;

    setIsInviting(true);
    setError(null);
    try {
      const response = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      if (!response.ok) {
        setError(await readError(response));
        return;
      }
      const data = (await response.json()) as { collaborator: Collaborator };
      setCollaborators((current) => [...current, data.collaborator]);
      setEmail("");
    } catch {
      setError("Could not send invite");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (collaborator: Collaborator) => {
    setRemovingId(collaborator.id);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/${collaborator.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        setError(await readError(response));
        return;
      }
      setCollaborators((current) =>
        current.filter((c) => c.id !== collaborator.id),
      );
    } catch {
      setError("Could not remove collaborator");
    } finally {
      setRemovingId(null);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/editor/${projectId}`,
      );
    } catch {
      setError("Could not copy link");
      return;
    }
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setEmail("");
        onOpenChange(next);
      }}
      title="Share project"
      icon={Share2}
      description={
        isOwner
          ? "Invite people by email to collaborate on this project."
          : "People with access to this project."
      }
      footer={
        <Button
          type="button"
          variant="outline"
          onClick={handleCopy}
          className="w-full sm:w-auto"
        >
          {copied ? (
            <Check className="h-4 w-4 text-state-success" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? "Copied!" : "Copy link"}
        </Button>
      }
    >
      <div className="space-y-4">
        {isOwner && (
          <form onSubmit={handleInvite} className="flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              aria-label="Collaborator email"
              disabled={isInviting}
            />
            <Button type="submit" disabled={!email.trim() || isInviting}>
              <UserPlus className="h-4 w-4" />
              {isInviting ? "Inviting…" : "Invite"}
            </Button>
          </form>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-xl bg-state-error/10 px-3 py-2 text-xs text-state-error"
          >
            {error}
          </p>
        )}

        <div>
          <h3 className="mb-1 flex items-center gap-1.5 text-xs font-medium tracking-wide text-copy-muted uppercase">
            <Users className="h-3.5 w-3.5" />
            Collaborators
            {!isLoading && (
              <span className="rounded-full bg-subtle px-1.5 text-[11px] text-copy-secondary">
                {collaborators.length}
              </span>
            )}
          </h3>
          {isLoading ? (
            <p className="flex items-center gap-2 px-2 py-3 text-sm text-copy-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </p>
          ) : collaborators.length === 0 ? (
            <p className="rounded-xl border border-dashed border-surface-border px-3 py-4 text-center text-sm text-copy-muted">
              No collaborators yet.
            </p>
          ) : (
            <ul className="max-h-60 space-y-1 overflow-y-auto">
              {collaborators.map((collaborator) => (
                <CollaboratorRow
                  key={collaborator.id}
                  collaborator={collaborator}
                  canRemove={isOwner}
                  isRemoving={removingId === collaborator.id}
                  onRemove={handleRemove}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppDialog>
  );
}
