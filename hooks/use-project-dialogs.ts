"use client";

import { useState } from "react";

import { MOCK_PROJECTS, slugify } from "@/lib/projects";
import type { Project } from "@/lib/projects";

type DialogState =
  | { type: "closed" }
  | { type: "create" }
  | { type: "rename"; project: Project }
  | { type: "delete"; project: Project };

const MOCK_LATENCY_MS = 400;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Owns project dialog state, form state and loading state. Projects are
 * mock, in-memory data only: nothing is sent to an API or persisted.
 */
export function useProjectDialogs() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [dialog, setDialog] = useState<DialogState>({ type: "closed" });
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const slug = slugify(name);
  const canSubmit = slug.length > 0 && !isLoading;

  const close = () => {
    if (isLoading) return;
    setDialog({ type: "closed" });
  };

  const openCreate = () => {
    setName("");
    setDialog({ type: "create" });
  };

  const openRename = (project: Project) => {
    setName(project.name);
    setDialog({ type: "rename", project });
  };

  const openDelete = (project: Project) => {
    setDialog({ type: "delete", project });
  };

  const submit = async () => {
    if (dialog.type === "closed" || isLoading) return;
    if (dialog.type !== "delete" && !canSubmit) return;

    setIsLoading(true);
    await wait(MOCK_LATENCY_MS);

    if (dialog.type === "create") {
      setProjects((prev) => [
        { id: crypto.randomUUID(), name: name.trim(), slug, role: "owner" },
        ...prev,
      ]);
    } else if (dialog.type === "rename") {
      const { id } = dialog.project;
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, name: name.trim(), slug } : p)),
      );
    } else {
      const { id } = dialog.project;
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }

    setIsLoading(false);
    setDialog({ type: "closed" });
  };

  return {
    projects,
    dialog,
    name,
    setName,
    slug,
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
