"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { primaryBtn } from "./styles";

type Fields = {
  country: string;
  school: string;
  program: string;
  background: string;
  goal: string;
};

const empty: Fields = { country: "", school: "", program: "", background: "", goal: "" };

export function SopStudio() {
  const { notify } = useApp();
  const [fields, setFields] = useState<Fields>(empty);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  function update(key: keyof Fields, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function generate() {
    if (fields.program.trim().length < 2 || fields.background.trim().length < 20 || fields.goal.trim().length < 20) {
      setError("Add the program, a short background, and what you want to do next.");
      setDraft("");
      return;
    }
    setError("");
    const country = fields.country.trim() || "the country I am applying to";
    const school = fields.school.trim() || "the university";
    setDraft(
      [
        `I am applying to the ${fields.program.trim()} program at ${school} because the work I want to do sits in ${country}, and this program is specific enough to get me there.`,
        "",
        fields.background.trim(),
        "",
        `What I want from the program is practical: ${fields.goal.trim()}`,
        "",
        "I am not asking the program to invent a direction for me. I am asking for the courses, critique, and people that make this plan harder to fake and easier to finish.",
      ].join("\n"),
    );
  }

  return (
    <div className="thin-scroll mx-auto flex h-full w-full max-w-3xl flex-col gap-6 overflow-y-auto px-4 py-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Statement of purpose</h1>
        <p className="mt-1 text-sm text-muted">
          One page instead of a country-by-country wizard. Fill the facts, then edit the draft in your own voice.
        </p>
      </header>
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          generate();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Country" id="sop-country" value={fields.country} onChange={(value) => update("country", value)} />
          <Field label="University" id="sop-school" value={fields.school} onChange={(value) => update("school", value)} />
        </div>
        <Field label="Program" id="sop-program" value={fields.program} onChange={(value) => update("program", value)} required />
        <Area label="Background" id="sop-background" value={fields.background} onChange={(value) => update("background", value)} hint="What you have already done. Two or three sentences." />
        <Area label="Goal" id="sop-goal" value={fields.goal} onChange={(value) => update("goal", value)} hint="What you want to be able to do after the program." />
        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className={`${primaryBtn} self-start`}>
          Write a draft
        </button>
      </form>
      {draft ? (
        <section aria-live="polite" className="rounded-2xl border border-line bg-elev p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Draft</h2>
            <button
              type="button"
              className="text-sm text-muted underline-offset-2 hover:underline"
              onClick={() => {
                void navigator.clipboard.writeText(draft);
                notify("Draft copied");
              }}
            >
              Copy
            </button>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-6">{draft}</p>
        </section>
      ) : null}
    </div>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  required = false,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-xl border border-line bg-elev px-3 text-base"
      />
    </div>
  );
}

function Area({
  label,
  id,
  value,
  onChange,
  hint,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  hint: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        aria-describedby={`${id}-hint`}
        className="mt-2 w-full resize-y rounded-xl border border-line bg-elev px-3 py-2 text-base"
      />
      <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
        {hint}
      </p>
    </div>
  );
}
