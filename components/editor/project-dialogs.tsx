"use client";

import type { FormEvent } from "react";

import { AppDialog } from "@/components/ui/app-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProjectDialogsController } from "@/hooks/use-project-dialogs";

interface ProjectDialogsProps {
  controller: ProjectDialogsController;
}

export function ProjectDialogs({ controller }: ProjectDialogsProps) {
  const {
    dialog,
    name,
    setName,
    slug,
    error,
    canSubmit,
    isLoading,
    close,
    submit,
  } = controller;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void submit();
  };

  const cancelButton = (
    <Button type="button" variant="ghost" onClick={close} disabled={isLoading}>
      Cancel
    </Button>
  );

  const nameField = (
    <Input
      autoFocus
      value={name}
      onChange={(event) => setName(event.target.value)}
      placeholder="Project name"
      aria-label="Project name"
      disabled={isLoading}
    />
  );

  const errorMessage = error && (
    <p role="alert" className="text-xs text-state-error">
      {error}
    </p>
  );

  return (
    <>
      <AppDialog
        open={dialog.type === "create"}
        onOpenChange={(open) => !open && close()}
        title="Create project"
        description="Give your architecture workspace a name."
        footer={
          <>
            {cancelButton}
            <Button
              type="submit"
              form="create-project-form"
              disabled={!canSubmit}
            >
              {isLoading ? "Creating…" : "Create"}
            </Button>
          </>
        }
      >
        <form
          id="create-project-form"
          onSubmit={handleSubmit}
          className="space-y-2"
        >
          {nameField}
          <p className="text-xs text-copy-muted">
            Room ID:{" "}
            <span className="font-mono text-copy-secondary">
              {slug ? `${slug}-xxxxxx` : "—"}
            </span>
          </p>
          {errorMessage}
        </form>
      </AppDialog>

      <AppDialog
        open={dialog.type === "rename"}
        onOpenChange={(open) => !open && close()}
        title="Rename project"
        description={
          dialog.type === "rename"
            ? `Current name: ${dialog.project.name}`
            : undefined
        }
        footer={
          <>
            {cancelButton}
            <Button
              type="submit"
              form="rename-project-form"
              disabled={!canSubmit}
            >
              {isLoading ? "Renaming…" : "Rename"}
            </Button>
          </>
        }
      >
        <form
          id="rename-project-form"
          onSubmit={handleSubmit}
          className="space-y-2"
        >
          {nameField}
          {errorMessage}
        </form>
      </AppDialog>

      <AppDialog
        open={dialog.type === "delete"}
        onOpenChange={(open) => !open && close()}
        title="Delete project"
        description={
          dialog.type === "delete"
            ? `Are you sure you want to delete "${dialog.project.name}"? This action cannot be undone.`
            : undefined
        }
        footer={
          <>
            {errorMessage}
            {cancelButton}
            <Button
              type="button"
              variant="destructive"
              onClick={() => void submit()}
              disabled={isLoading}
            >
              {isLoading ? "Deleting…" : "Delete"}
            </Button>
          </>
        }
      />
    </>
  );
}
