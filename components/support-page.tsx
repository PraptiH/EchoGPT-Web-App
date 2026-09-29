"use client";

import { useState } from "react";
import Link from "next/link";
import { faqs } from "@/lib/data";
import { primaryBtn } from "./styles";

type FormState = { name: string; email: string; topic: string; message: string };

const empty: FormState = { name: "", email: "", topic: "Bug", message: "" };

export function SupportPage() {
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  function submit() {
    const next: Partial<FormState> = {};
    if (form.name.trim().length < 2) next.name = "Add your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email.";
    if (form.message.trim().length < 12) next.message = "Describe the issue in a sentence or two.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSent(true);
  }

  return (
    <div className="thin-scroll mx-auto grid h-full w-full max-w-5xl gap-8 overflow-y-auto px-4 py-8 lg:grid-cols-2">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Support</h1>
        <p className="mt-2 text-sm text-muted">
          Email{" "}
          <a className="underline-offset-2 hover:underline" href="mailto:appifydevs@gmail.com">
            appifydevs@gmail.com
          </a>
          . The team aims to reply within 48 hours. This form stays in the browser and confirms that your note is ready to send.
        </p>
        {sent ? (
          <p className="mt-6 rounded-2xl border border-line bg-elev p-4 text-sm" role="status">
            Thanks, {form.name.trim()}. Copy your note into an email to appifydevs@gmail.com so a person can read it. Include the page you were on and what you expected to happen.
          </p>
        ) : (
          <form
            className="mt-6 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
            noValidate
          >
            <Field
              id="support-name"
              label="Name"
              value={form.name}
              error={errors.name}
              onChange={(name) => setForm((current) => ({ ...current, name }))}
            />
            <Field
              id="support-email"
              label="Email"
              type="email"
              value={form.email}
              error={errors.email}
              onChange={(email) => setForm((current) => ({ ...current, email }))}
            />
            <div>
              <label htmlFor="support-topic" className="text-sm font-medium">
                Topic
              </label>
              <select
                id="support-topic"
                value={form.topic}
                onChange={(event) => setForm((current) => ({ ...current, topic: event.target.value }))}
                className="mt-2 h-11 w-full rounded-xl border border-line bg-elev px-3 text-base"
              >
                <option>Bug</option>
                <option>Billing</option>
                <option>Account</option>
                <option>Something else</option>
              </select>
            </div>
            <div>
              <label htmlFor="support-message" className="text-sm font-medium">
                What happened
              </label>
              <textarea
                id="support-message"
                value={form.message}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                rows={5}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "support-message-error" : undefined}
                className="mt-2 w-full resize-y rounded-xl border border-line bg-elev px-3 py-2 text-base"
              />
              {errors.message ? (
                <p id="support-message-error" className="mt-1 text-sm text-danger">
                  {errors.message}
                </p>
              ) : null}
            </div>
            <button type="submit" className={`${primaryBtn} justify-self-start`}>
              Prepare message
            </button>
          </form>
        )}
      </section>
      <section>
        <h2 className="text-lg font-semibold">Common questions</h2>
        <div className="mt-4 flex flex-col gap-2">
          {faqs.slice(0, 4).map((item, index) => {
            const expanded = open === index;
            return (
              <div key={item.q} className="rounded-2xl border border-line bg-elev">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? null : index)}
                >
                  {item.q}
                  <span aria-hidden="true">{expanded ? "–" : "+"}</span>
                </button>
                {expanded ? <p className="px-4 pb-3 text-sm text-muted">{item.a}</p> : null}
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-muted">
          Read the <Link href="/privacy" className="underline-offset-2 hover:underline">privacy notes</Link> and{" "}
          <Link href="/terms" className="underline-offset-2 hover:underline">terms</Link>.
        </p>
      </section>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-2 h-11 w-full rounded-xl border border-line bg-elev px-3 text-base"
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
