"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { useOthers } from "@liveblocks/react";

const MAX_VISIBLE = 5;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function PresenceAvatars() {
  const { user } = useUser();
  const collaborators = useOthers((others) =>
    others
      .filter((other) => other.id !== user?.id)
      .map((other) => ({
        connectionId: other.connectionId,
        name: other.info?.name ?? "Anonymous",
        avatar: other.info?.avatar,
        color: other.info?.color,
      })),
    (a, b) => JSON.stringify(a) === JSON.stringify(b),
  );

  const visible = collaborators.slice(0, MAX_VISIBLE);
  const overflow = collaborators.length - visible.length;

  return (
    <div className="absolute right-4 top-4 z-10 flex items-center rounded-full border border-surface-border bg-surface/90 p-1 backdrop-blur">
      {collaborators.length > 0 && (
        <>
          <div className="flex items-center pl-1">
            {visible.map((person) => (
              <div
                key={person.connectionId}
                title={person.name}
                className="-ml-2 flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full text-[10px] font-semibold text-black ring-2 ring-surface first:ml-0"
                style={{ backgroundColor: person.color }}
              >
                {person.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element -- remote Clerk avatar, display-only
                  <img
                    src={person.avatar}
                    alt={person.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(person.name)
                )}
              </div>
            ))}
            {overflow > 0 && (
              <div className="-ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-subtle text-[10px] font-semibold text-copy-primary ring-2 ring-surface">
                +{overflow}
              </div>
            )}
          </div>
          <div className="mx-2 h-5 w-px bg-surface-border" />
        </>
      )}
      <UserButton
        appearance={{ elements: { avatarBox: "h-7 w-7" } }}
      />
    </div>
  );
}
