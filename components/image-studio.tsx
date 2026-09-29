"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { imageRatios } from "@/lib/data";
import { useApp } from "@/lib/store";
import { hueFrom, uid } from "@/lib/utils";
import { ghostBtn, primaryBtn } from "./styles";
import { Icon } from "./icon";

export function ImageStudio() {
  const { images, addCreation, removeCreation, notify, plan } = useApp();
  const [prompt, setPrompt] = useState("");
  const [ratio, setRatio] = useState<(typeof imageRatios)[number]>("1:1");
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = images.find((item) => item.id === openId) ?? null;

  useEffect(() => {
    if (!openId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId]);

  async function generate() {
    const text = prompt.trim();
    if (!text || busy) return;
    setBusy(true);
    window.setTimeout(() => {
      addCreation("images", {
        id: uid(),
        prompt: text,
        modelName: "Image preview",
        meta: ratio,
        createdAt: Date.now(),
        hue: hueFrom(text),
      });
      setBusy(false);
      notify("Preview added to your creations");
    }, 500);
  }

  return (
    <div className="thin-scroll mx-auto flex h-full w-full max-w-5xl flex-col gap-6 overflow-y-auto px-4 py-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Images</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Describe a picture, pick a frame, and keep the results on this device. On echogpt.live, image generation is a Plus feature and uses one message.
        </p>
        {plan !== "plus" ? (
          <p className="mt-3 text-sm">
            <Link href="/pricing" className="font-medium underline-offset-2 hover:underline">
              Preview Plus
            </Link>{" "}
            <span className="text-muted">to match the paid studio, or generate a local preview below.</span>
          </p>
        ) : null}
      </header>
      <form
        className="rounded-2xl border border-line bg-elev p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void generate();
        }}
      >
        <label htmlFor="image-prompt" className="text-sm font-medium">
          Prompt
        </label>
        <textarea
          id="image-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={3}
          placeholder="A quiet reading room at dusk, wide window, warm lamp"
          className="mt-2 w-full resize-y rounded-xl border border-line bg-bg px-3 py-2 text-base"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted" id="ratio-label">
            Aspect ratio
          </span>
          <div role="group" aria-labelledby="ratio-label" className="flex flex-wrap gap-1">
            {imageRatios.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={ratio === item}
                onClick={() => setRatio(item)}
                className={`rounded-full px-3 py-1.5 text-sm ${ratio === item ? "bg-primary text-white" : "border border-line hover:bg-soft"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <button type="submit" className={`${primaryBtn} ml-auto`} disabled={busy || !prompt.trim()}>
            {busy ? "Generating…" : "Generate"}
          </button>
        </div>
      </form>
      <section aria-labelledby="creations-heading">
        <h2 id="creations-heading" className="text-sm font-semibold">
          Your creations
        </h2>
        {images.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
            Nothing here yet. Describe an image above to start.
          </p>
        ) : (
          <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((item) => (
              <li key={item.id} className="overflow-hidden rounded-2xl border border-line bg-elev">
                <button
                  type="button"
                  className="block w-full text-left"
                  onClick={() => setOpenId(item.id)}
                  aria-label={`View image: ${item.prompt}`}
                >
                  <Canvas hue={item.hue} label={item.prompt} ratio={item.meta} />
                </button>
                <div className="flex items-start justify-between gap-2 p-3">
                  <p className="line-clamp-2 text-sm">{item.prompt}</p>
                  <button
                    type="button"
                    aria-label="Delete image"
                    className="rounded-lg p-2 text-danger hover:bg-soft"
                    onClick={() => {
                      removeCreation("images", item.id);
                      notify("Image deleted");
                    }}
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      {open ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4">
          <div role="dialog" aria-modal="true" aria-label="Generated image" className="w-full max-w-3xl">
            <Canvas hue={open.hue} label={open.prompt} ratio={open.meta} large />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                className={ghostBtn}
                onClick={() => {
                  void navigator.clipboard.writeText(open.prompt);
                  notify("Prompt copied");
                }}
              >
                Copy prompt
              </button>
              <button type="button" className={primaryBtn} onClick={() => setOpenId(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Canvas({
  hue,
  label,
  ratio,
  large = false,
}: {
  hue: number;
  label: string;
  ratio: string;
  large?: boolean;
}) {
  const aspect = ratio === "16:9" ? "16/9" : ratio === "9:16" ? "9/16" : ratio === "4:5" ? "4/5" : "1/1";
  return (
    <div
      className="grid place-items-end p-4 text-white"
      style={{
        aspectRatio: aspect,
        minHeight: large ? "16rem" : undefined,
        background: `linear-gradient(145deg, hsl(${hue} 62% 42%), hsl(${(hue + 36) % 360} 48% 18%))`,
      }}
    >
      <span className="max-w-full rounded-lg bg-black/35 px-2 py-1 text-xs">{label}</span>
    </div>
  );
}
