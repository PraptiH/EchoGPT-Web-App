"use client";

import { useMemo, useState } from "react";
import { models, type Model } from "@/lib/data";
import { Dialog } from "./dialog";

type ModelDialogProps = {
  open: boolean;
  selectedId: string;
  plan: "free" | "plus";
  onClose: () => void;
  onSelect: (model: Model) => void;
  onLocked: (model: Model) => void;
};

export function ModelDialog({
  open,
  selectedId,
  plan,
  onClose,
  onSelect,
  onLocked,
}: ModelDialogProps) {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return models;
    return models.filter((model) =>
      `${model.name} ${model.provider} ${model.blurb}`.toLowerCase().includes(needle),
    );
  }, [query]);

  return (
    <Dialog
      open={open}
      title="Choose a model"
      description="Free models are available now. Plus models stay visible so you can see what upgrades unlock."
      onClose={onClose}
      wide
    >
      <label className="sr-only" htmlFor="model-search">
        Filter models
      </label>
      <input
        id="model-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by name or provider"
        className="mb-4 h-11 w-full rounded-xl border border-line bg-bg px-3 text-base"
      />
      <ul className="flex flex-col gap-2">
        {visible.map((model) => {
          const locked = model.tier === "pro" && plan !== "plus";
          const selected = model.id === selectedId;
          return (
            <li key={model.id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => (locked ? onLocked(model) : onSelect(model))}
                className={`flex w-full items-start justify-between gap-3 rounded-xl border px-3 py-3 text-left ${selected ? "border-primary bg-primary/10" : "border-line hover:bg-soft"}`}
              >
                <span>
                  <span className="block text-sm font-semibold">
                    {model.name}
                    <span className="ml-2 text-xs font-medium text-muted">{model.provider}</span>
                  </span>
                  <span className="mt-1 block text-sm text-muted">{model.blurb}</span>
                  <span className="mt-2 flex flex-wrap gap-1">
                    {model.caps.map((cap) => (
                      <span key={cap} className="rounded-full bg-soft px-2 py-0.5 text-[11px] text-muted">
                        {cap}
                      </span>
                    ))}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-medium text-muted">
                  {locked ? "Plus" : selected ? "Selected" : "Free"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Dialog>
  );
}
