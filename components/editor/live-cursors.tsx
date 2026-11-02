"use client";

import { useUser } from "@clerk/nextjs";
import { ViewportPortal, useStore } from "@xyflow/react";
import { useOthers } from "@liveblocks/react";

export function LiveCursors() {
  const { user } = useUser();
  const zoom = useStore((state) => state.transform[2]);
  const others = useOthers();

  return (
    <ViewportPortal>
      {others.map((other) => {
        if (other.id === user?.id || !other.presence.cursor) return null;
        const color = other.info?.color ?? "#60A5FA";
        const { x, y } = other.presence.cursor;

        return (
          <div
            key={other.connectionId}
            className="pointer-events-none absolute left-0 top-0 z-50"
            style={{
              transform: `translate(${x}px, ${y}px) scale(${1 / zoom})`,
              transformOrigin: "top left",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill={color}>
              <path d="M1 1l5.5 14 2-5.5L14 7.5z" stroke="#0a0a0a" strokeWidth="1" />
            </svg>
            <span
              className="ml-3 -mt-1 block w-max rounded-full px-2 py-0.5 text-[11px] font-medium text-black"
              style={{ backgroundColor: color }}
            >
              {other.info?.name ?? "Anonymous"}
            </span>
          </div>
        );
      })}
    </ViewportPortal>
  );
}
