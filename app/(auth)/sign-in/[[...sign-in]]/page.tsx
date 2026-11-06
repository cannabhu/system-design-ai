import type { Metadata } from "next";
import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";

import {
  AuthShell,
  authFormAppearance,
} from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  robots: { index: false },
};

export default function SignInPage() {
  return (
    <AuthShell>
      <Suspense>
        <SignIn appearance={authFormAppearance} />
      </Suspense>
    </AuthShell>
  );
}
