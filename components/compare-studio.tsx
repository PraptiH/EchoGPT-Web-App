"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { models } from "@/lib/data";
import { previewReply } from "@/lib/replies";
import { useApp } from "@/lib/store";
import { primaryBtn } from "./styles";
import { Icon } from "./icon";

export function CompareStudio() {
  const { plan, consumeQuota, notify } = useApp();
  const freeModels = models.filter((model) => model.tier === "free" || plan === "plus");
  const [selected, setSelected] = useState<string[]>(freeModels.slice(0, 3).map((model) => model.id));
  const [prompt, setPrompt] = useState("");
  const [answers, setAnswers] = useState<{ id: string; name: string; text: string; error?: string }[]>([]);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<number | null>(null);
  const runningRef = useRef(false);

  function clearTimer() {
    if (timerRef.current === null) return;
    window.clearInterval(timerRef.current);
    timerRef.current = null;
  }

  useEffect(() => clearTimer, []);

  function toggle(id: string) {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
  }

  async function run() {
    const text = prompt.trim();
    if (!text || selected.length < 2 || runningRef.current) return;
    if (!consumeQuota()) {
      notify("Free message limit reached. It resets every 5 hours.");
      return;
    }
    clearTimer();
    runningRef.current = true;
    setRunning(true);
    setAnswers(
      selected.map((id) => ({
        id,
        name: models.find((model) => model.id === id)?.name ?? id,
        text: "",
      })),
    );
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const full = selected.map((id, index) => ({
      id,
      name: models.find((model) => model.id === id)?.name ?? id,
      text: previewReply(text, id, index),
    }));
    if (reduced) {
      setAnswers(full);
      runningRef.current = false;
      setRunning(false);
      return;
    }
    let step = 0;
    timerRef.current = window.setInterval(() => {
      step += 12;
      setAnswers(
        full.map((item) => ({
          ...item,
          text: item.text.slice(0, step),
        })),
      );
      if (step >= Math.max(...full.map((item) => item.text.length))) {
        clearTimer();
        runningRef.current = false;
        setRunning(false);
      }
    }, 16);
  }

  return (
    <div className="thin-scroll mx-auto flex h-full w-full max-w-6xl flex-col gap-6 overflow-y-auto px-4 py-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Compare</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Pick two or three models. They answer the same prompt so you can judge the difference before you commit to one.
        </p>
      </header>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Models</legend>
        <div className="flex flex-wrap gap-2">
          {models.map((model) => {
            const locked = model.tier === "pro" && plan !== "plus";
            const on = selected.includes(model.id);
            return locked ? (
              <Link
                key={model.id}
                href="/pricing"
                className="rounded-full border border-line px-3 py-2 text-sm text-muted"
              >
                {model.name} · Plus
              </Link>
            ) : (
              <button
                key={model.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(model.id)}
                className={`rounded-full border px-3 py-2 text-sm ${on ? "border-primary bg-primary/10 font-medium" : "border-line hover:bg-soft"}`}
              >
                {model.name}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted">{selected.length} of 3 selected</p>
      </fieldset>
      <form
        className="rounded-2xl border border-line bg-elev p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void run();
        }}
      >
        <label htmlFor="compare-prompt" className="text-sm font-medium">
          Prompt
        </label>
        <textarea
          id="compare-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={4}
          placeholder="Ask one question for every selected model"
          className="mt-2 w-full resize-y rounded-xl border border-line bg-bg px-3 py-2 text-base"
        />
        <button type="submit" className={`${primaryBtn} mt-3`} disabled={running || selected.length < 2 || !prompt.trim()}>
          {running ? "Comparing…" : "Compare"}
        </button>
      </form>
      {answers.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {answers.map((answer) => (
            <article key={answer.id} className="flex min-w-0 flex-col rounded-2xl border border-line bg-elev">
              <header className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
                <h2 className="truncate text-sm font-semibold">{answer.name}</h2>
                <button
                  type="button"
                  aria-label={`Copy ${answer.name} answer`}
                  className="rounded-lg p-2 text-muted hover:bg-soft hover:text-fg"
                  onClick={() => {
                    void navigator.clipboard.writeText(answer.text);
                    notify("Copied");
                  }}
                >
                  <Icon name="copy" size={16} />
                </button>
              </header>
              <p className="whitespace-pre-wrap px-4 py-3 text-sm leading-6">{answer.text || "Writing…"}</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
          Choose at least two models, then ask one question.
        </p>
      )}
    </div>
  );
}
