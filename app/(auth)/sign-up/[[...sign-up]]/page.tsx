import type { Metadata } from "next";
import { Suspense } from "react";
import { SignUp } from "@clerk/nextjs";

import {
  AuthShell,
  authFormAppearance,
} from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  robots: { index: false },
};

export default function SignUpPage() {
  return (
    <AuthShell>
      <Suspense>
        <SignUp appearance={authFormAppearance} />
      </Suspense>
    </AuthShell>
  );
}
