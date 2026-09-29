"use client";

import { useState } from "react";
import Link from "next/link";
import { videoLengths } from "@/lib/data";
import { useApp } from "@/lib/store";
import { hueFrom, uid } from "@/lib/utils";
import { primaryBtn } from "./styles";
import { Icon } from "./icon";

export function VideoStudio() {
  const { videos, addCreation, removeCreation, notify, plan } = useApp();
  const [prompt, setPrompt] = useState("");
  const [seconds, setSeconds] = useState<(typeof videoLengths)[number]>(6);
  const [audio, setAudio] = useState(true);
  const [busy, setBusy] = useState(false);

  function generate() {
    const text = prompt.trim();
    if (!text || busy) return;
    setBusy(true);
    window.setTimeout(() => {
      addCreation("videos", {
        id: uid(),
        prompt: text,
        modelName: "Video preview",
        meta: `${seconds}s · ${audio ? "audio on" : "audio off"}`,
        createdAt: Date.now(),
        hue: hueFrom(text + seconds),
      });
      setBusy(false);
      notify("Preview added to your creations");
    }, 700);
  }

  return (
    <div className="thin-scroll mx-auto flex h-full w-full max-w-5xl flex-col gap-6 overflow-y-auto px-4 py-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Video</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Describe the clip, then choose length and audio. On echogpt.live this is a Plus feature and each video uses one message.
        </p>
        {plan !== "plus" ? (
          <Link href="/pricing" className="mt-3 inline-block text-sm font-medium underline-offset-2 hover:underline">
            See Plus
          </Link>
        ) : null}
      </header>
      <form
        className="rounded-2xl border border-line bg-elev p-4"
        onSubmit={(event) => {
          event.preventDefault();
          generate();
        }}
      >
        <label htmlFor="video-prompt" className="text-sm font-medium">
          Prompt
        </label>
        <textarea
          id="video-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={3}
          placeholder="A paper boat crossing a rain puddle, camera close to the water"
          className="mt-2 w-full resize-y rounded-xl border border-line bg-bg px-3 py-2 text-base"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Length in seconds">
            {videoLengths.map((length) => (
              <button
                key={length}
                type="button"
                aria-pressed={seconds === length}
                onClick={() => setSeconds(length)}
                className={`rounded-full px-3 py-1.5 text-sm ${seconds === length ? "bg-primary text-white" : "border border-line hover:bg-soft"}`}
              >
                {length}s
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-pressed={audio}
            onClick={() => setAudio((value) => !value)}
            className="rounded-full border border-line px-3 py-1.5 text-sm hover:bg-soft"
          >
            {audio ? "Audio on" : "Audio off"}
          </button>
          <button type="submit" className={`${primaryBtn} ml-auto`} disabled={busy || !prompt.trim()}>
            {busy ? "Starting…" : "Generate"}
          </button>
        </div>
      </form>
      <section aria-labelledby="video-creations">
        <h2 id="video-creations" className="text-sm font-semibold">
          Your creations
        </h2>
        {videos.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
            Nothing here yet. Describe a video above to start.
          </p>
        ) : (
          <ul className="mt-3 grid gap-4 sm:grid-cols-2">
            {videos.map((item) => (
              <li key={item.id} className="overflow-hidden rounded-2xl border border-line bg-elev">
                <div
                  className="grid aspect-video place-items-center text-white"
                  style={{
                    background: `linear-gradient(160deg, hsl(${item.hue} 55% 32%), hsl(${(item.hue + 50) % 360} 40% 12%))`,
                  }}
                >
                  <span className="rounded-full bg-black/40 px-3 py-1 text-xs">{item.meta}</span>
                </div>
                <div className="flex items-start justify-between gap-3 p-3">
                  <div>
                    <p className="text-sm">{item.prompt}</p>
                    <p className="mt-1 text-xs text-muted">{item.meta}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      aria-label="Copy prompt"
                      className="rounded-lg p-2 text-muted hover:bg-soft hover:text-fg"
                      onClick={() => {
                        void navigator.clipboard.writeText(item.prompt);
                        notify("Prompt copied");
                      }}
                    >
                      <Icon name="copy" size={16} />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete video"
                      className="rounded-lg p-2 text-danger hover:bg-soft"
                      onClick={() => {
                        removeCreation("videos", item.id);
                        notify("Video deleted");
                      }}
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
