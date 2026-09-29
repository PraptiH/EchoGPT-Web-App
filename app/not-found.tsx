import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="text-sm font-medium text-muted">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">That page is not in EchoGPT</h1>
        <p className="mt-2 text-sm text-muted">The link may be old, or the address has a typo.</p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-4 text-sm font-medium text-white"
        >
          Back to chat
        </Link>
      </div>
    </main>
  );
}
