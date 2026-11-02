import "server-only";

import { LiveblocksError } from "@liveblocks/node";
import { prisma } from "@/lib/prisma";
import { getLiveblocks } from "@/lib/liveblocks";

const BATCH_SIZE = 25;
const MAX_BACKOFF_MS = 60 * 60 * 1000;

function backoffMs(attempts: number) {
  return Math.min(MAX_BACKOFF_MS, 30_000 * 2 ** attempts);
}

// A room that no longer exists counts as cleaned up.
function isRoomMissing(error: unknown) {
  return error instanceof LiveblocksError && error.status === 404;
}

async function cleanUpRoom(roomId: string, attempts: number) {
  try {
    try {
      await getLiveblocks().deleteRoom(roomId);
    } catch (error) {
      if (!isRoomMissing(error)) throw error;
    }
    await prisma.liveblocksRoomCleanup.deleteMany({ where: { roomId } });
    return true;
  } catch (error) {
    console.warn(`Failed to delete Liveblocks room ${roomId}`, error);
    await prisma.liveblocksRoomCleanup.updateMany({
      where: { roomId },
      data: {
        attempts: { increment: 1 },
        lastError: error instanceof Error ? error.message : String(error),
        nextAttemptAt: new Date(Date.now() + backoffMs(attempts)),
      },
    });
    return false;
  }
}

/** Attempts one queued room immediately; leaves it queued for retry on failure. */
export async function attemptRoomCleanup(roomId: string) {
  const row = await prisma.liveblocksRoomCleanup.findUnique({
    where: { roomId },
    select: { attempts: true },
  });
  if (!row) return true;
  return cleanUpRoom(roomId, row.attempts);
}

/** Retries every due cleanup intent. Intended for a scheduled caller. */
export async function drainRoomCleanups() {
  const due = await prisma.liveblocksRoomCleanup.findMany({
    where: { nextAttemptAt: { lte: new Date() } },
    orderBy: { nextAttemptAt: "asc" },
    take: BATCH_SIZE,
    select: { roomId: true, attempts: true },
  });

  let cleaned = 0;
  for (const { roomId, attempts } of due) {
    if (await cleanUpRoom(roomId, attempts)) cleaned++;
  }
  return { processed: due.length, cleaned };
}
