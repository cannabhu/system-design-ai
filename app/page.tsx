import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

async function AuthRedirect(): Promise<null> {
  const { userId } = await auth();

  redirect(userId ? "/editor" : "/sign-in");
}

export default function Home() {
  return (
    <Suspense>
      <AuthRedirect />
    </Suspense>
  );
}
