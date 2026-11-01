"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogsProvider } from "@/components/editor/project-dialogs-context";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import type { Project } from "@/lib/projects";

interface EditorShellProps {
  ownedProjects: Project[];
  sharedProjects: Project[];
  children: ReactNode;
}

export function EditorShell({
  ownedProjects,
  sharedProjects,
  children,
}: EditorShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ProjectDialogsProvider>
      <div className="flex h-screen flex-col bg-base">
        <EditorNavbar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        />
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <ProjectSidebar
            isOpen={isSidebarOpen}
            ownedProjects={ownedProjects}
            sharedProjects={sharedProjects}
            onClose={() => setIsSidebarOpen(false)}
          />
          {children}
        </div>
      </div>
    </ProjectDialogsProvider>
  );
}
