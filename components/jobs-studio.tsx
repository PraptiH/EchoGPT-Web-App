"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { formatWhen, uid } from "@/lib/utils";
import { primaryBtn } from "./styles";
import { Icon } from "./icon";

const skillBank = [
  "communication",
  "sql",
  "python",
  "react",
  "typescript",
  "leadership",
  "figma",
  "testing",
  "writing",
  "research",
];

function analyze(text: string) {
  const lower = text.toLowerCase();
  const found = skillBank.filter((skill) => lower.includes(skill));
  const missing = skillBank.filter((skill) => !found.includes(skill)).slice(0, 3);
  const title = text
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean)
    ?.slice(0, 80) || "Untitled role";
  return {
    title,
    found,
    missing,
    questions: [
      `Which result in your background best matches “${title}”?`,
      "Tell me about a time you disagreed with a teammate and what changed.",
      found[0]
        ? `Walk through a project where ${found[0]} changed the outcome.`
        : "Which skill on this post would you need to learn first, and how?",
    ],
  };
}

export function JobsStudio() {
  const { jobs, addJob, removeJob, notify } = useApp();
  const [posting, setPosting] = useState("");
  const [resume, setResume] = useState("");
  const [result, setResult] = useState<ReturnType<typeof analyze> | null>(null);
  const [error, setError] = useState("");

  function submit() {
    if (posting.trim().length < 40) {
      setError("Paste a job post with at least a few sentences.");
      return;
    }
    setError("");
    const next = analyze(`${posting}\n${resume}`);
    setResult(next);
    addJob({
      id: uid(),
      title: next.title,
      excerpt: posting.trim().slice(0, 140),
      createdAt: Date.now(),
    });
    notify("Job insight saved");
  }

  return (
    <div className="thin-scroll mx-auto grid h-full w-full max-w-6xl gap-6 overflow-y-auto px-4 py-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Job insight</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Paste a posting and, if you want, a few resume lines. You get the skills that match, the gaps, and three interview questions.
          </p>
        </header>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div>
            <label htmlFor="job-post" className="text-sm font-medium">
              Job post
            </label>
            <textarea
              id="job-post"
              value={posting}
              onChange={(event) => setPosting(event.target.value)}
              rows={8}
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "job-error" : undefined}
              placeholder="Paste the title and description"
              className="mt-2 w-full resize-y rounded-xl border border-line bg-elev px-3 py-2 text-base"
            />
            {error ? (
              <p id="job-error" className="mt-2 text-sm text-danger">
                {error}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="resume-notes" className="text-sm font-medium">
              Resume notes <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea
              id="resume-notes"
              value={resume}
              onChange={(event) => setResume(event.target.value)}
              rows={4}
              placeholder="A few bullets from your current resume"
              className="mt-2 w-full resize-y rounded-xl border border-line bg-elev px-3 py-2 text-base"
            />
          </div>
          <button type="submit" className={`${primaryBtn} self-start`}>
            Analyze
          </button>
        </form>
        {result ? (
          <section aria-live="polite" className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-line bg-elev p-4">
              <h2 className="text-sm font-semibold">Skills mentioned</h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {result.found.length === 0 ? (
                  <li className="text-sm text-muted">None of the tracked skills showed up. Add tools from the post if you want a tighter match.</li>
                ) : (
                  result.found.map((skill) => (
                    <li key={skill} className="rounded-full bg-soft px-3 py-1 text-sm">
                      {skill}
                    </li>
                  ))
                )}
              </ul>
            </article>
            <article className="rounded-2xl border border-line bg-elev p-4">
              <h2 className="text-sm font-semibold">Worth preparing</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
                {result.missing.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </article>
            <article className="rounded-2xl border border-line bg-elev p-4 sm:col-span-2">
              <h2 className="text-sm font-semibold">Interview practice</h2>
              <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm">
                {result.questions.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ol>
            </article>
          </section>
        ) : null}
      </div>
      <aside className="rounded-2xl border border-line bg-elev p-4">
        <h2 className="text-sm font-semibold">Saved posts</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {jobs.length === 0 ? (
            <li className="text-sm text-muted">No jobs yet.</li>
          ) : (
            jobs.map((job) => (
              <li key={job.id} className="rounded-xl border border-line p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{job.title}</p>
                    <p className="mt-1 text-xs text-muted">{formatWhen(job.createdAt)}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Delete ${job.title}`}
                    className="rounded-lg p-1 text-danger hover:bg-soft"
                    onClick={() => removeJob(job.id)}
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </aside>
    </div>
  );
}
