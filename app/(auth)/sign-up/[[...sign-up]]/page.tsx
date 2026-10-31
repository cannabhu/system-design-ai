import { Suspense } from "react";
import { SignUp } from "@clerk/nextjs";

import {
  AuthShell,
  authFormAppearance,
} from "@/components/auth/auth-shell";

export default function SignUpPage() {
  return (
    <AuthShell>
      <Suspense>
        <SignUp appearance={authFormAppearance} />
      </Suspense>
    </AuthShell>
  );
}
