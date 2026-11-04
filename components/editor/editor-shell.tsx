"use client";

import { useCallback, useRef, useState } from "react";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";

import {
  AiChatContext,
  type AiChatState,
} from "@/components/editor/ai-chat-context";
import {
  AiStatusContext,
  type AiStatusState,
} from "@/components/editor/ai-status-context";
import {
  DISCONNECTED_TEAM_CHAT,
  TeamChatContext,
  type TeamChatState,
} from "@/components/editor/team-chat-context";
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
  const [aiStatus, setAiStatus] = useState<AiStatusState>({
    isGenerating: false,
    statusText: null,
    statusRunId: null,
  });
  const [aiChat, setAiChat] = useState<AiChatState>({
    messages: [],
    currentUserId: null,
    send: async () => {
      throw new Error("Chat is not connected");
    },
  });
  const [teamChat, setTeamChat] = useState<TeamChatState>(
    DISCONNECTED_TEAM_CHAT,
  );
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
        <AiStatusContext.Provider
          value={{ state: aiStatus, setState: setAiStatus }}
        >
          <AiChatContext.Provider
            value={{ state: aiChat, setState: setAiChat }}
          >
          <TeamChatContext.Provider
            value={{ state: teamChat, setState: setTeamChat }}
          >
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
                  value={{
                    isOpen: isTemplatesOpen,
                    setOpen: setIsTemplatesOpen,
                  }}
                >
                  {children}
                </StarterTemplatesContext.Provider>
              </CanvasSaveContext.Provider>
            </div>
            {activeProject && (
              <AiSidebar
                roomId={activeProject.id}
                isOpen={isAiSidebarOpen}
                onClose={() => setIsAiSidebarOpen(false)}
              />
            )}
          </div>
          </TeamChatContext.Provider>
          </AiChatContext.Provider>
        </AiStatusContext.Provider>
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
