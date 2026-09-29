"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";

export function AuthScreen() {
  const router = useRouter();
  const { signIn, signOut, user, notify } = useApp();

  function social(provider: string) {
    signIn({
      name: provider,
      email: `preview@${provider.toLowerCase()}.invalid`,
      provider,
    });
    notify(`Signed in with a ${provider} preview`);
    router.push("/");
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-primary p-10 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <img src="/assets/images/logo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-lg" />
          EchoGPT
        </Link>
        <div>
          <h1 className="max-w-md text-4xl font-semibold tracking-tight">Many models. One place to try them.</h1>
          <p className="mt-4 max-w-md text-white/85">
            Chat, compare answers, and keep job drafts together. This preview stores the session on your device.
          </p>
        </div>
        <p className="text-sm text-white/80">Free usage resets every 5 hours.</p>
      </section>
      <section className="flex flex-col justify-center px-5 py-10 sm:px-10">
        <Link href="/" className="mb-8 text-sm text-muted underline-offset-2 hover:underline lg:hidden">
          Back to EchoGPT
        </Link>
        <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
        {user ? (
          <div className="mt-6 rounded-2xl border border-line bg-elev p-4 text-sm">
            <p>
              You are signed in as <span className="font-medium">{user.name}</span> via {user.provider}.
            </p>
            <button
              type="button"
              className="mt-3 text-sm text-danger underline-offset-2 hover:underline"
              onClick={() => {
                signOut();
                notify("Signed out");
              }}
            >
              Sign out
            </button>
          </div>
        ) : null}
        <div className="mt-6 grid gap-2">
          {["Google", "GitHub"].map((provider) => (
            <button
              key={provider}
              type="button"
              onClick={() => social(provider)}
              className="h-11 rounded-xl border border-line bg-elev text-sm font-medium hover:bg-soft"
            >
              Continue with {provider}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-muted">
          These buttons create a local preview session. They do not contact Google or GitHub.
        </p>
      </section>
    </div>
  );
}
