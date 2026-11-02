"use client";

import { createContext, useContext } from "react";

import type { SaveStatus } from "@/hooks/use-canvas-autosave";

interface CanvasSaveState {
  status: SaveStatus;
  setStatus: (status: SaveStatus) => void;
  /** Registered by the canvas so the navbar Save button can flush a save. */
  registerSave: (save: (() => void) | null) => void;
  save: () => void;
}

/**
 * Lets the navbar (outside the Liveblocks room) show the save status and
 * trigger a save for the canvas that owns the collaborative flow state.
 */
export const CanvasSaveContext = createContext<CanvasSaveState>({
  status: "idle",
  setStatus: () => {},
  registerSave: () => {},
  save: () => {},
});

export function useCanvasSave() {
  return useContext(CanvasSaveContext);
}
