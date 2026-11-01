"use client";

import { createContext, useContext } from "react";

interface StarterTemplatesState {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

/**
 * Lets the navbar (outside the Liveblocks room) open the templates modal that
 * is rendered inside the canvas, where the collaborative flow state lives.
 */
export const StarterTemplatesContext = createContext<StarterTemplatesState>({
  isOpen: false,
  setOpen: () => {},
});

export function useStarterTemplates() {
  return useContext(StarterTemplatesContext);
}
