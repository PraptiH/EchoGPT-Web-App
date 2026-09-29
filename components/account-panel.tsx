"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { ghostBtn, primaryBtn } from "./styles";

export function AccountPanel() {
  const router = useRouter();
  const { ready, user, plan, signOut, notify } = useApp();

  if (!ready) {
    return <p className="p-6 text-sm text-muted">Loading account…</p>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="mt-2 text-sm text-muted">Sign in to see this session.</p>
        <Link href="/login" className={`${primaryBtn} mt-6`}>
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="thin-scroll mx-auto flex h-full w-full max-w-xl flex-col gap-6 overflow-y-auto px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="mt-1 text-sm text-muted">This session stays in this browser.</p>
      </header>
      <dl className="grid gap-4 rounded-2xl border border-line bg-elev p-5 text-sm">
        <div>
          <dt className="text-muted">Name</dt>
          <dd className="mt-1 font-medium">{user.name}</dd>
        </div>
        <div>
          <dt className="text-muted">Email</dt>
          <dd className="mt-1 font-medium">{user.email}</dd>
        </div>
        <div>
          <dt className="text-muted">Signed in with</dt>
          <dd className="mt-1 font-medium">{user.provider}</dd>
        </div>
        <div>
          <dt className="text-muted">Plan</dt>
          <dd className="mt-1 font-medium">{plan === "plus" ? "Plus" : "Free"}</dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-2">
        <Link href="/pricing" className={primaryBtn}>
          Manage plan
        </Link>
        <button
          type="button"
          className={ghostBtn}
          onClick={() => {
            signOut();
            notify("Signed out");
            router.push("/");
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
