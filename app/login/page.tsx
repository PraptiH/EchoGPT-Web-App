import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthScreen } from "@/components/auth-screen";

export const metadata: Metadata = { title: "Sign in" };

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted">Loading sign in…</p>}>
      <AuthScreen />
    </Suspense>
  );
}
