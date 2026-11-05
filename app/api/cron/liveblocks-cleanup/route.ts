import { drainRoomCleanups } from "@/lib/liveblocks-cleanup";
import { jsonError } from "@/lib/project-request";
import { withSentry } from "@/lib/sentry-capture";

export const GET = withSentry(async (request: Request) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return jsonError("Unauthorized", 401);
  }

  return Response.json(await drainRoomCleanups());
});
