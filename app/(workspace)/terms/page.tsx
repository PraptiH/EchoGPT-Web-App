import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms" };

export default function Page() {
  return (
    <article className="thin-scroll mx-auto h-full w-full max-w-3xl overflow-y-auto px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Terms</h1>
      <div className="mt-4 space-y-4 text-sm leading-6 text-muted">
        <p>
          Use EchoGPT for your own work. Do not share an account. Replies in this preview are generated in the browser so you can review the interface. They are not a substitute for the models on echogpt.live.
        </p>
        <p>
          Plus on the live service can be cancelled, and the current billing period is not refunded. Prices and checkout stay on echogpt.live.
        </p>
        <p>
          Connect only MCP servers you trust. A connector’s tools can act on your behalf.
        </p>
        <p>
          <Link href="/pricing" className="text-fg underline-offset-2 hover:underline">
            Read the plan details
          </Link>
        </p>
      </div>
    </article>
  );
}
