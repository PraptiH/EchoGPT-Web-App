import type { Metadata } from "next";
import { Suspense } from "react";
import { ChatWorkspace } from "@/components/chat-workspace";

export const metadata: Metadata = {
  title: "Chat",
  description: "Ask EchoGPT, switch models, and keep the thread in this browser.",
};

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted">Loading chat…</p>}>
      <ChatWorkspace />
    </Suspense>
  );
}
