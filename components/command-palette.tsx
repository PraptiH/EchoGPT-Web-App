"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { models, navItems } from "@/lib/data";
import { useApp } from "@/lib/store";
import { Dialog } from "./dialog";
import { Icon } from "./icon";

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
};

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { chats, setTheme, theme } = useApp();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  const items = useMemo(() => {
    const actions = [
      { id: "new", label: "New chat", hint: "Chat", run: () => router.push(`/?new=${Date.now()}`) },
      {
        id: "theme",
        label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
        hint: "Appearance",
        run: () => setTheme(theme === "dark" ? "light" : "dark"),
      },
      ...navItems.map((item) => ({
        id: item.href,
        label: item.label,
        hint: "Go to",
        run: () => router.push(item.href),
      })),
      { id: "pricing", label: "Pricing", hint: "Go to", run: () => router.push("/pricing") },
      { id: "support", label: "Support", hint: "Go to", run: () => router.push("/support") },
      { id: "history", label: "All chat history", hint: "Go to", run: () => router.push("/history") },
      ...models.map((model) => ({
        id: model.id,
        label: model.name,
        hint: model.tier === "pro" ? "Plus model" : "Free model",
        run: () => router.push(`/?model=${model.id}`),
      })),
      ...chats.slice(0, 8).map((chat) => ({
        id: chat.id,
        label: chat.title,
        hint: "Recent chat",
        run: () => router.push(`/?chat=${chat.id}`),
      })),
    ];
    const needle = query.trim().toLowerCase();
    if (!needle) return actions.slice(0, 12);
    return actions.filter((item) => item.label.toLowerCase().includes(needle)).slice(0, 12);
  }, [chats, query, router, setTheme, theme]);

  return (
    <Dialog open={open} title="Search EchoGPT" description="Jump to a tool, model, or chat." onClose={onClose}>
      <label className="sr-only" htmlFor="command-search">
        Search
      </label>
      <input
        id="command-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Type a page, model, or chat"
        className="mb-3 h-11 w-full rounded-xl border border-line bg-bg px-3 text-base"
      />
      <ul className="flex flex-col gap-1">
        {items.length === 0 ? (
          <li className="px-2 py-6 text-center text-sm text-muted">No matches.</li>
        ) : (
          items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-soft"
                onClick={() => {
                  item.run();
                  onClose();
                }}
              >
                <span className="truncate text-sm font-medium">{item.label}</span>
                <span className="shrink-0 text-xs text-muted">{item.hint}</span>
              </button>
            </li>
          ))
        )}
      </ul>
    </Dialog>
  );
}

export function PaletteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-full items-center gap-2 rounded-xl border border-line bg-bg px-3 text-sm text-muted hover:text-fg"
    >
      <Icon name="search" size={18} />
      <span className="flex-1 text-left">Search</span>
      <kbd className="rounded-md border border-line px-1.5 py-0.5 text-[10px]">Ctrl K</kbd>
    </button>
  );
}
