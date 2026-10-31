"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

import { useProjectDialogs } from "@/hooks/use-project-dialogs";
import type { ProjectDialogsController } from "@/hooks/use-project-dialogs";
import { ProjectDialogs } from "@/components/editor/project-dialogs";

const ProjectDialogsContext = createContext<ProjectDialogsController | null>(
  null,
);

export function ProjectDialogsProvider({ children }: { children: ReactNode }) {
  const controller = useProjectDialogs();

  return (
    <ProjectDialogsContext.Provider value={controller}>
      {children}
      <ProjectDialogs controller={controller} />
    </ProjectDialogsContext.Provider>
  );
}

export function useProjectDialogsContext(): ProjectDialogsController {
  const context = useContext(ProjectDialogsContext);
  if (!context) {
    throw new Error(
      "useProjectDialogsContext must be used within ProjectDialogsProvider",
    );
  }
  return context;
}
