"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { createRoomId, slugify } from "@/lib/projects";
import type { Project } from "@/lib/projects";

type DialogState =
  | { type: "closed" }
  | { type: "create" }
  | { type: "rename"; project: Project }
  | { type: "delete"; project: Project };

async function readError(response: Response): Promise<string> {
  try {
    const { error } = (await response.json()) as { error?: string };
    if (error) return error;
  } catch {
    // Fall through to the generic message.
  }
  return "Something went wrong. Please try again.";
}

/**
 * Owns project dialog state, form state and loading state, and performs
 * project mutations against `/api/projects`.
 */
export function useProjectDialogs() {
  const router = useRouter();
  const pathname = usePathname();
  const [dialog, setDialog] = useState<DialogState>({ type: "closed" });
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = slugify(name);
  const canSubmit = slug.length > 0 && !isLoading;

  const close = () => {
    if (isLoading) return;
    setDialog({ type: "closed" });
  };

  const openCreate = () => {
    setName("");
    setError(null);
    setDialog({ type: "create" });
  };

  const openRename = (project: Project) => {
    setName(project.name);
    setError(null);
    setDialog({ type: "rename", project });
  };

  const openDelete = (project: Project) => {
    setError(null);
    setDialog({ type: "delete", project });
  };

  const createProject = async () => {
    const id = createRoomId(name);
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: name.trim() }),
    });
    if (!response.ok) throw new Error(await readError(response));

    router.push(`/editor/${id}`);
    router.refresh();
  };

  const renameProject = async (project: Project) => {
    const response = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (!response.ok) throw new Error(await readError(response));

    router.refresh();
  };

  const deleteProject = async (project: Project) => {
    const response = await fetch(`/api/projects/${project.id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error(await readError(response));

    if (pathname === `/editor/${project.id}`) {
      router.push("/editor");
    }
    router.refresh();
  };

  const submit = async () => {
    if (dialog.type === "closed" || isLoading) return;
    if (dialog.type !== "delete" && !canSubmit) return;

    setIsLoading(true);
    setError(null);

    try {
      if (dialog.type === "create") await createProject();
      else if (dialog.type === "rename") await renameProject(dialog.project);
      else await deleteProject(dialog.project);

      setDialog({ type: "closed" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    dialog,
    name,
    setName,
    slug,
    error,
    canSubmit,
    isLoading,
    openCreate,
    openRename,
    openDelete,
    close,
    submit,
  };
}

export type ProjectDialogsController = ReturnType<typeof useProjectDialogs>;
