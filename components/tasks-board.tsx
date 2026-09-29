"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { taskCategories, tasks } from "@/lib/data";

export function TasksBoard() {
  const router = useRouter();
  const [category, setCategory] = useState<(typeof taskCategories)[number] | "All">("All");
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return tasks.filter((task) => {
      const inCategory = category === "All" || task.category === category;
      const inQuery = !needle || `${task.title} ${task.description}`.toLowerCase().includes(needle);
      return inCategory && inQuery;
    });
  }, [category, query]);

  return (
    <div className="thin-scroll mx-auto flex h-full w-full max-w-5xl flex-col gap-6 overflow-y-auto px-4 py-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Start from a job to be done. Each card opens chat with the prompt ready to finish.
        </p>
      </header>
      <label className="sr-only" htmlFor="task-search">
        Search tasks
      </label>
      <input
        id="task-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search tasks"
        className="h-16 min-h-16 rounded-xl border border-line bg-elev px-4 text-base"
      />
      <div role="tablist" aria-label="Task categories" className="flex gap-2 overflow-x-auto">
        {(["All", ...taskCategories] as const).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={category === item}
            onClick={() => setCategory(item)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${category === item ? "bg-primary text-white" : "border border-line hover:bg-soft"}`}
          >
            {item}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
          No tasks match that search.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {visible.map((task) => (
            <li key={task.title}>
              <button
                type="button"
                onClick={() => router.push(`/?prompt=${encodeURIComponent(task.prompt)}`)}
                className="h-full w-full rounded-2xl border border-line bg-elev p-5 text-left hover:border-primary"
              >
                <p className="text-xs font-medium text-muted">{task.category}</p>
                <h2 className="mt-2 text-base font-semibold">{task.title}</h2>
                <p className="mt-1 text-sm text-muted">{task.description}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
