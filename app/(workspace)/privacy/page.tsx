import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy" };

export default function Page() {
  return (
    <article className="thin-scroll mx-auto h-full w-full max-w-3xl overflow-y-auto px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Privacy</h1>
      <div className="mt-4 space-y-4 text-sm leading-6 text-muted">
        <p>
          This redesigned EchoGPT interface keeps chats, connectors, studio previews, and your session in local storage on this device. It does not send prompts to a model provider.
        </p>
        <p>
          Clearing site data in the browser deletes that history. Sign-in on this preview does not create an account on a server.
        </p>
        <p>
          The live product at echogpt.live has its own privacy policy. Questions can go to{" "}
          <a className="text-fg underline-offset-2 hover:underline" href="mailto:appifydevs@gmail.com">
            appifydevs@gmail.com
          </a>
          .
        </p>
        <p>
          <Link href="/support" className="text-fg underline-offset-2 hover:underline">
            Contact support
          </Link>
        </p>
      </div>
    </article>
  );
}
