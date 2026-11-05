import { currentUser } from "@clerk/nextjs/server";

import { getCursorColor } from "@/lib/cursor-color";
import { getLiveblocks } from "@/lib/liveblocks";
import { getCurrentIdentity, getProjectIfAccessible } from "@/lib/project-access";
import { INVALID_JSON, jsonError, readJsonBody } from "@/lib/project-request";
import { withSentry } from "@/lib/sentry-capture";

export const POST = withSentry(async (request: Request, _ctx, tags) => {
  const identity = await getCurrentIdentity();
  if (!identity) return jsonError("Unauthorized", 401);

  const body = await readJsonBody(request);
  if (body === INVALID_JSON) return jsonError("Invalid JSON", 400);
  const room =
    typeof body === "object" && body !== null
      ? (body as { room?: unknown }).room
      : undefined;
  if (typeof room !== "string" || room === "") {
    return jsonError("Room is required", 400);
  }

  // The project ID is the Liveblocks room ID.
  tags.projectId = room;
  const project = await getProjectIfAccessible(room, identity);
  if (!project) return jsonError("Forbidden", 403);

  const liveblocks = getLiveblocks();
  await liveblocks.getOrCreateRoom(project.id, { defaultAccesses: [] });

  const user = await currentUser();
  const name =
    user?.fullName ??
    user?.username ??
    user?.primaryEmailAddress?.emailAddress ??
    "Anonymous";

  const session = liveblocks.prepareSession(identity.userId, {
    userInfo: {
      name,
      avatar: user?.imageUrl ?? "",
      color: getCursorColor(identity.userId),
    },
  });
  session.allow(project.id, ["*:write"]);

  const { status, body: token } = await session.authorize();
  return new Response(token, { status });
});
