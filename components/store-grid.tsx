"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { storeApps } from "@/lib/data";

export function StoreGrid() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return storeApps;
    return storeApps.filter((app) => `${app.title} ${app.description}`.toLowerCase().includes(needle));
  }, [query]);

  return (
    <div className="thin-scroll mx-auto flex h-full w-full max-w-5xl flex-col gap-6 overflow-y-auto px-4 py-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Store</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Focused assistants with a starting instruction. Open one and it lands in chat, ready for your details.
        </p>
      </header>
      <label className="sr-only" htmlFor="store-search">
        Search assistants
      </label>
      <input
        id="store-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search assistants"
        className="h-11 rounded-xl border border-line bg-elev px-3 text-base"
      />
      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
          No assistants match that search.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((app) => (
            <li key={app.slug}>
              <button
                type="button"
                onClick={() => router.push(`/?prompt=${encodeURIComponent(app.starter)}`)}
                className="flex h-full w-full flex-col rounded-2xl border border-line bg-elev p-5 text-left hover:border-primary"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-soft text-sm font-semibold">
                  {app.title.slice(0, 1)}
                </span>
                <h2 className="mt-4 text-base font-semibold">{app.title}</h2>
                <p className="mt-1 text-sm text-muted">{app.description}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
