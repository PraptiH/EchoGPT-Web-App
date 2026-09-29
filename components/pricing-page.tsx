"use client";

import { useState } from "react";
import Link from "next/link";
import { faqs, plans } from "@/lib/data";
import { useApp } from "@/lib/store";
import { primaryBtn } from "./styles";

export function PricingPage() {
  const { plan, setPlan, notify, user } = useApp();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="thin-scroll mx-auto flex h-full w-full max-w-4xl flex-col gap-10 overflow-y-auto px-4 py-8">
      <header className="text-center">
        <p className="text-sm font-medium text-muted">Pricing</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Plans that stay easy to compare</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted">
          Free resets every 5 hours. Plus adds advanced models plus image and video. Checkout prices live on echogpt.live. Here you can preview the plan so the rest of the app unlocks.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((item) => {
          const current = (item.id === "plus" && plan === "plus") || (item.id === "free" && plan === "free");
          return (
            <article
              key={item.id}
              className={`rounded-2xl border bg-elev p-5 ${item.id === "plus" ? "border-primary" : "border-line"}`}
            >
              {item.id === "plus" ? (
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Recommended</p>
              ) : (
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Start here</p>
              )}
              <h2 className="mt-2 text-xl font-semibold">{item.name}</h2>
              <p className="mt-1 text-sm text-muted">{item.cadence}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {item.points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span aria-hidden="true" className="text-primary">
                      ✓
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
              {item.id === "plus" ? (
                <button
                  type="button"
                  className={`${primaryBtn} mt-5 w-full`}
                  onClick={() => {
                    if (!user) {
                      notify("Sign in first, then preview Plus.");
                      return;
                    }
                    setPlan("plus");
                    notify("Plus preview is on for this browser");
                  }}
                >
                  {current ? "Plus preview is on" : "Preview Plus"}
                </button>
              ) : (
                <button
                  type="button"
                  className="mt-5 h-11 w-full rounded-xl border border-line text-sm font-medium hover:bg-soft"
                  onClick={() => {
                    setPlan("free");
                    notify("Switched back to Free");
                  }}
                >
                  {current ? "Current plan" : "Use Free"}
                </button>
              )}
            </article>
          );
        })}
      </div>
      <p className="rounded-2xl border border-line bg-elev px-4 py-3 text-sm text-muted">
        If you subscribe on echogpt.live and cancel, the current period is not refunded. Account sharing is not allowed.
      </p>
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">Questions</h2>
        <p className="mt-2 text-sm text-muted">
          Still stuck? <Link href="/support" className="underline-offset-2 hover:underline">Contact support</Link>.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {faqs.map((item, index) => {
            const expanded = open === index;
            return (
              <div key={item.q} className="rounded-2xl border border-line bg-elev">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? null : index)}
                >
                  <span className="font-medium">{item.q}</span>
                  <span aria-hidden="true" className="text-muted">
                    {expanded ? "–" : "+"}
                  </span>
                </button>
                {expanded ? <p className="px-4 pb-4 text-sm leading-6 text-muted">{item.a}</p> : null}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
