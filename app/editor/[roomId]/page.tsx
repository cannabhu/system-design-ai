import { Suspense } from "react";
import { redirect } from "next/navigation";

import { AccessDenied } from "@/components/editor/access-denied";
import { WorkspaceCanvas } from "@/components/editor/workspace-canvas";
import {
  getCurrentIdentity,
  getProjectIfAccessible,
} from "@/lib/project-access";

async function Workspace({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;

  const identity = await getCurrentIdentity();
  if (!identity) redirect("/sign-in");

  const project = await getProjectIfAccessible(roomId, identity);
  if (!project) return <AccessDenied />;

  return <WorkspaceCanvas roomId={project.id} />;
}

export default function WorkspacePage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  return (
    <Suspense fallback={<div className="h-full bg-base" />}>
      <Workspace params={params} />
    </Suspense>
  );
}
