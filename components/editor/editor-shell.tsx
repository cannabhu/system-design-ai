"use client";

import { useCallback, useRef, useState } from "react";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { CanvasSaveContext } from "@/components/editor/canvas-save-context";
import { ProjectDialogsProvider } from "@/components/editor/project-dialogs-context";
import { AiSidebar } from "@/components/editor/ai-sidebar";
import { ShareDialog } from "@/components/editor/share-dialog";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { StarterTemplatesContext } from "@/components/editor/starter-templates-context";
import type { SaveStatus } from "@/hooks/use-canvas-autosave";
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
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const saveHandler = useRef<(() => void) | null>(null);
  const registerSave = useCallback((save: (() => void) | null) => {
    saveHandler.current = save;
  }, []);
  const save = useCallback(() => saveHandler.current?.(), []);
  const { roomId } = useParams<{ roomId?: string }>();
  const activeProject = roomId
    ? [...ownedProjects, ...sharedProjects].find((p) => p.id === roomId)
    : undefined;

  return (
    <ProjectDialogsProvider>
      <div className="flex h-screen flex-col bg-base">
        <EditorNavbar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
          projectName={activeProject?.name}
          isAiSidebarOpen={isAiSidebarOpen}
          onShare={() => setIsShareOpen(true)}
          onOpenTemplates={() => setIsTemplatesOpen(true)}
          saveStatus={saveStatus}
          onSave={save}
          onToggleAiSidebar={() => setIsAiSidebarOpen((open) => !open)}
        />
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <ProjectSidebar
            isOpen={isSidebarOpen}
            ownedProjects={ownedProjects}
            sharedProjects={sharedProjects}
            onClose={() => setIsSidebarOpen(false)}
          />
          <div className="min-w-0 flex-1">
            <CanvasSaveContext.Provider
              value={{
                status: saveStatus,
                setStatus: setSaveStatus,
                registerSave,
                save,
              }}
            >
              <StarterTemplatesContext.Provider
                value={{ isOpen: isTemplatesOpen, setOpen: setIsTemplatesOpen }}
              >
                {children}
              </StarterTemplatesContext.Provider>
            </CanvasSaveContext.Provider>
          </div>
          {activeProject && (
            <AiSidebar
              isOpen={isAiSidebarOpen}
              onClose={() => setIsAiSidebarOpen(false)}
            />
          )}
        </div>
      </div>
      {activeProject && (
        <ShareDialog
          open={isShareOpen}
          onOpenChange={setIsShareOpen}
          projectId={activeProject.id}
          role={activeProject.role}
          key={activeProject.id}
        />
      )}
    </ProjectDialogsProvider>
  );
}
