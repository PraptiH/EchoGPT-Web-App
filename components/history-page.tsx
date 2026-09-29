"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { formatWhen } from "@/lib/utils";
import { Dialog } from "./dialog";
import { Icon } from "./icon";

export function HistoryPage() {
  const { chats, deleteChat, notify } = useApp();
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const pending = chats.find((chat) => chat.id === pendingId) ?? null;
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return chats;
    return chats.filter((chat) =>
      `${chat.title} ${chat.messages.map((message) => message.content).join(" ")}`.toLowerCase().includes(needle),
    );
  }, [chats, query]);

  return (
    <div className="thin-scroll mx-auto flex h-full w-full max-w-3xl flex-col gap-6 overflow-y-auto px-4 py-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">History</h1>
        <p className="mt-1 text-sm text-muted">Search every chat stored in this browser.</p>
      </header>
      <label className="sr-only" htmlFor="history-search">
        Search chat history
      </label>
      <input
        id="history-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search chat history"
        className="h-11 rounded-xl border border-line bg-elev px-3 text-base"
      />
      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
          {chats.length === 0 ? "No chats yet." : "No chats match that search."}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((chat) => (
            <li key={chat.id} className="flex items-center gap-2 rounded-2xl border border-line bg-elev p-3">
              <Link href={`/?chat=${chat.id}`} className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{chat.title}</span>
                <span className="text-xs text-muted">{formatWhen(chat.updatedAt)}</span>
              </Link>
              <button
                type="button"
                aria-label={`Delete ${chat.title}`}
                className="rounded-lg p-2 text-danger hover:bg-soft"
                onClick={() => setPendingId(chat.id)}
              >
                <Icon name="trash" size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Dialog
        open={Boolean(pending)}
        title="Delete this chat?"
        description={pending ? `“${pending.title}” will be removed from this browser.` : undefined}
        onClose={() => setPendingId(null)}
      >
        <div className="flex gap-2">
          <button
            type="button"
            className="h-11 rounded-xl bg-danger px-4 text-sm font-medium text-white"
            onClick={() => {
              if (!pending) return;
              deleteChat(pending.id);
              notify("Chat deleted");
              setPendingId(null);
            }}
          >
            Delete
          </button>
          <button type="button" className="h-11 rounded-xl px-4 text-sm hover:bg-soft" onClick={() => setPendingId(null)}>
            Keep
          </button>
        </div>
      </Dialog>
    </div>
  );
}
