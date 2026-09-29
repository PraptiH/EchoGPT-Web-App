"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { modelById, suggestions, type Model } from "@/lib/data";
import { previewReply } from "@/lib/replies";
import { useApp, type Message } from "@/lib/store";
import { formatWhen, uid } from "@/lib/utils";
import { Dialog } from "./dialog";
import { Icon } from "./icon";
import { ModelDialog } from "./model-dialog";

function CardMark() {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
      <Icon name="chat" size={16} />
    </span>
  );
}

export function ChatWorkspace() {
  const router = useRouter();
  const params = useSearchParams();
  const chatParam = params.get("chat");
  const promptParam = params.get("prompt");
  const fresh = params.get("new");
  const modelParam = params.get("model");
  const {
    chats,
    connectors,
    modelId,
    setModelId,
    plan,
    beginTurn,
    revertTurn,
    appendMessage,
    replaceMessage,
    removeLastAssistant,
    consumeQuota,
    notify,
    user,
  } = useApp();

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [modelOpen, setModelOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [mention, setMention] = useState<string | null>(null);
  const boxRef = useRef<HTMLTextAreaElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  const activeId = chatParam || pendingId;
  const chat = chats.find((item) => item.id === activeId) ?? null;
  const model = modelById(chat?.modelId || modelId);

  const mentions = useMemo(() => {
    if (mention === null) return [];
    const needle = mention.toLowerCase();
    return connectors
      .filter((connector) => connector.enabled)
      .flatMap((connector) => [
        { token: connector.name, hint: "Connector" },
        ...connector.tools.map((tool) => ({ token: tool, hint: connector.name })),
      ])
      .filter((item) => item.token.toLowerCase().includes(needle))
      .slice(0, 6);
  }, [connectors, mention]);

  useEffect(() => {
    if (fresh) {
      setPendingId(null);
      setDraft("");
      setAttachment(null);
    }
  }, [fresh]);

  useEffect(() => {
    if (promptParam) setDraft(promptParam);
  }, [promptParam]);

  useEffect(() => {
    if (!modelParam) return;
    const next = modelById(modelParam);
    if (next.tier === "pro" && plan !== "plus") {
      setUpgradeOpen(true);
      return;
    }
    setModelId(next.id);
  }, [modelParam, plan, setModelId]);

  useEffect(() => {
    if (!chat?.messages.length) return;
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight });
  }, [chat?.messages, streamingId]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  function stopStream() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    setStreamingId(null);
  }

  function streamReply(chatId: string, messageId: string, prompt: string, chosenModel: string) {
    const full = previewReply(prompt, chosenModel);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      replaceMessage(chatId, messageId, full);
      setStreamingId(null);
      return;
    }
    let index = 0;
    timerRef.current = window.setInterval(() => {
      index = Math.min(full.length, index + 8);
      replaceMessage(chatId, messageId, full.slice(0, index));
      if (index >= full.length) stopStream();
    }, 16);
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || streamingId) return;
    const userMessage: Message = {
      id: uid(),
      role: "user",
      content,
      createdAt: Date.now(),
      attachmentName: attachment?.name,
    };
    const assistantMessage: Message = {
      id: uid(),
      role: "assistant",
      content: "",
      modelId: model.id,
      createdAt: Date.now(),
    };
    const chatId = beginTurn(activeId, model.id, userMessage, assistantMessage);
    if (!consumeQuota()) {
      revertTurn(chatId, [userMessage.id, assistantMessage.id]);
      setUpgradeOpen(true);
      return;
    }
    if (!activeId) {
      setPendingId(chatId);
      router.replace(`/?chat=${chatId}`);
    }
    setDraft("");
    setAttachment(null);
    setMention(null);
    if (boxRef.current) boxRef.current.style.height = "";
    setStreamingId(assistantMessage.id);
    const promptWithFile = attachment
      ? `${content}\n\nAttached file: ${attachment.name}`
      : content;
    streamReply(chatId, assistantMessage.id, promptWithFile, model.id);
  }

  function onDraftChange(value: string, cursor: number) {
    setDraft(value);
    const match = value.slice(0, cursor).match(/@([\w-]*)$/);
    setMention(match ? match[1] : null);
    const el = boxRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(Math.max(el.scrollHeight, 52), 180)}px`;
  }

  function insertMention(token: string) {
    const el = boxRef.current;
    const cursor = el?.selectionStart ?? draft.length;
    const next = draft.slice(0, cursor).replace(/@([\w-]*)$/, `@${token} `) + draft.slice(cursor);
    setDraft(next);
    setMention(null);
    el?.focus();
  }

  function copyTranscript() {
    const transcript = (chat?.messages ?? [])
      .map((message) => `${message.role === "user" ? "You" : model.name}: ${message.content}`)
      .join("\n\n");
    void navigator.clipboard.writeText(transcript);
    notify("Transcript copied");
    setShareOpen(false);
  }

  const inThread = Boolean(chat && chat.messages.length > 0);
  const recentCards: Array<{
    key: string;
    title: string;
    meta: string;
    tag: string;
    href?: string;
    prompt?: string;
  }> =
    chats.length > 0
      ? chats.slice(0, 3).map((item) => ({
          key: item.id,
          title: item.title,
          meta: `${modelById(item.modelId).name} · ${formatWhen(item.updatedAt)}`,
          tag: "Chat",
          href: `/?chat=${item.id}`,
        }))
      : [
          {
            key: "research",
            title: "Turn customer interviews into themes",
            meta: `${model.name} · 18 min ago`,
            tag: "Research",
            prompt: "Turn these customer interviews into themes, with a quote for each theme.",
          },
          {
            key: "strategy",
            title: "Outline the Q4 launch narrative",
            meta: "GPT-5.5 · Yesterday",
            tag: "Strategy",
            prompt: "Outline the Q4 launch narrative: audience, promise, proof, and the sequence of messages.",
          },
          {
            key: "compare",
            title: "Compare onboarding patterns",
            meta: "3 models · Monday",
            tag: "Compare",
            href: "/compare",
          },
        ];

  const composer = (
    <form
      className="w-full"
      onSubmit={(event) => {
        event.preventDefault();
        void send(draft);
      }}
    >
      {mentions.length > 0 ? (
        <ul className="mb-2 overflow-hidden rounded-2xl border border-line bg-elev" role="listbox" aria-label="Connectors">
          {mentions.map((item) => (
            <li key={`${item.hint}-${item.token}`}>
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-soft"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => insertMention(item.token)}
              >
                <span>@{item.token}</span>
                <span className="text-xs text-muted">{item.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="rounded-[22px] border border-line bg-elev px-4 py-3 shadow-[0_16px_40px_rgba(55,40,90,0.06)]">
        {attachment ? (
          <p className="mb-2 flex items-center justify-between gap-2 text-xs text-muted">
            <span className="truncate">{attachment.name}</span>
            <button type="button" className="underline-offset-2 hover:underline" onClick={() => setAttachment(null)}>
              Remove
            </button>
          </p>
        ) : null}
        <label className="sr-only" htmlFor="composer">
          Ask a question
        </label>
        <textarea
          id="composer"
          ref={boxRef}
          rows={2}
          value={draft}
          placeholder="Ask a question..."
          aria-describedby="composer-help"
          className="max-h-44 min-h-12 w-full resize-none bg-transparent py-1 text-base leading-6 outline-none placeholder:text-[#b0abba]"
          onChange={(event) => onDraftChange(event.target.value, event.target.selectionStart)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void send(draft);
            }
          }}
        />
        <div className="mt-2 flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            className="sr-only"
            onChange={(event) => setAttachment(event.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            aria-label="Attach a file"
            className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-soft hover:text-fg"
            onClick={() => fileRef.current?.click()}
          >
            <Icon name="paperclip" size={18} />
          </button>
          <button
            type="button"
            onClick={() => setModelOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-bg px-3 text-sm text-fg hover:bg-soft"
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
              {model.name.slice(0, 1)}
            </span>
            {model.name}
            <Icon name="chevron" size={14} className="rotate-90 text-muted" />
          </button>
          <button
            type="button"
            onClick={() => router.push("/connectors")}
            className="inline-flex h-9 items-center rounded-full border border-line px-3 text-sm text-fg hover:bg-soft"
          >
            Tools
          </button>
          <span className="flex-1" />
          {streamingId ? (
            <button type="button" className="h-10 rounded-full bg-fg px-4 text-sm font-medium text-bg" onClick={stopStream}>
              Stop
            </button>
          ) : (
            <button
              type="submit"
              aria-label="Send"
              className="grid h-10 w-10 place-items-center rounded-full bg-primary text-white hover:bg-[var(--primary-hover)] disabled:opacity-40"
              disabled={!draft.trim()}
            >
              <Icon name="send" size={18} className="-rotate-90" />
            </button>
          )}
        </div>
      </div>
      <p id="composer-help" className="sr-only">
        Enter sends. Shift Enter adds a line.
      </p>
    </form>
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={scrollerRef} className="thin-scroll flex-1 overflow-y-auto">
        <div className={`mx-auto flex w-full flex-col ${inThread ? "max-w-3xl gap-6 px-4 py-6" : "max-w-5xl px-4 py-8 sm:px-8"}`}>
          {inThread ? (
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm text-muted">
                {model.name}
                <span className="sr-only"> is answering this chat</span>
              </p>
              <button type="button" className="text-sm text-muted underline-offset-2 hover:underline" onClick={() => setShareOpen(true)}>
                Share
              </button>
            </div>
          ) : (
            <div className="flex w-full flex-col items-center pt-6 text-center sm:pt-10">
              <p className="inline-flex items-center gap-2 text-xs font-medium text-success">
                <span className="h-2 w-2 rounded-full bg-success" />
                All models ready
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
                Hello There! How can I assist you today?
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted sm:text-base">
                Start with a question, bring in a file, or choose a workflow. EchoGPT will route the work to the right model and tools.
              </p>
              <div className="mt-8 w-full max-w-3xl text-left">{composer}</div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setModelOpen(true)}
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-elev px-3 text-sm hover:bg-soft"
                >
                  Auto · best model
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">Recommended</span>
                  <Icon name="chevron" size={14} className="rotate-90 text-muted" />
                </button>
                <Link href="/compare" className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-elev px-3 text-sm hover:bg-soft">
                  <Icon name="columns" size={15} />
                  Compare models
                </Link>
                <Link href="/image" className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-elev px-3 text-sm hover:bg-soft">
                  <Icon name="image" size={15} />
                  Create image
                </Link>
                <Link href="/tasks" className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-elev px-3 text-sm hover:bg-soft">
                  <Icon name="tasks" size={15} />
                  Use a workflow
                </Link>
              </div>
              <div className="relative mt-10 grid w-full gap-8 text-left lg:grid-cols-2">
                <p className="absolute -top-1 right-0 hidden text-xs text-muted xl:block">Built to be edited</p>
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Recent chats</h2>
                    <Link href="/history" className="text-sm font-medium text-primary">
                      View all
                    </Link>
                  </div>
                  <ul className="flex flex-col gap-3">
                    {recentCards.map((card) => (
                      <li key={card.key}>
                        {card.href ? (
                          <Link href={card.href} className="flex items-center gap-3 rounded-2xl border border-line bg-elev px-3 py-3 hover:border-primary/30">
                            <CardMark />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium">{card.title}</span>
                              <span className="mt-0.5 block text-xs text-muted">{card.meta}</span>
                            </span>
                            <span className="rounded-full bg-soft px-2 py-1 text-[11px] text-muted">{card.tag}</span>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setDraft(card.prompt ?? card.title);
                              boxRef.current?.focus();
                            }}
                            className="flex w-full items-center gap-3 rounded-2xl border border-line bg-elev px-3 py-3 text-left hover:border-primary/30"
                          >
                            <CardMark />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium">{card.title}</span>
                              <span className="mt-0.5 block text-xs text-muted">{card.meta}</span>
                            </span>
                            <span className="rounded-full bg-soft px-2 py-1 text-[11px] text-muted">{card.tag}</span>
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h2 className="mb-3 text-sm font-semibold">Try a starting point</h2>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {suggestions.map((item) => (
                      <li key={item.title}>
                        <button
                          type="button"
                          onClick={() => {
                            if (item.title === "Explore with multiple models") {
                              router.push("/compare");
                              return;
                            }
                            setDraft(item.prompt);
                            boxRef.current?.focus();
                          }}
                          className="flex h-full w-full flex-col rounded-2xl border border-line bg-elev p-4 text-left hover:border-primary/30"
                        >
                          <span className="flex items-center justify-between gap-2 text-sm font-medium">
                            {item.title}
                            <Icon name="send" size={14} className="text-muted" />
                          </span>
                          <span className="mt-2 text-xs leading-5 text-muted">{item.prompt}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          )}
          <ol className="flex flex-col gap-4" aria-label="Messages">
            {chat?.messages.map((message) => (
              <li key={message.id} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <article
                  className={`max-w-[min(100%,40rem)] rounded-2xl px-4 py-3 ${message.role === "user" ? "bg-primary text-white" : "border border-line bg-elev"}`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-6">{message.content || "Writing…"}</p>
                  {message.attachmentName ? (
                    <p className={`mt-2 text-xs ${message.role === "user" ? "text-white/80" : "text-muted"}`}>
                      Attached: {message.attachmentName}
                    </p>
                  ) : null}
                  {message.role === "assistant" && message.content && streamingId !== message.id ? (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted hover:bg-soft hover:text-fg"
                        onClick={() => {
                          void navigator.clipboard.writeText(message.content);
                          notify("Copied");
                        }}
                      >
                        <Icon name="copy" size={14} />
                        Copy
                      </button>
                      <button
                        type="button"
                        className="rounded-lg px-2 py-1 text-xs text-muted hover:bg-soft hover:text-fg"
                        onClick={() => {
                          if (!chat || streamingId) return;
                          const previousUser = [...chat.messages].reverse().find((item) => item.role === "user");
                          if (!previousUser || !consumeQuota()) {
                            setUpgradeOpen(true);
                            return;
                          }
                          removeLastAssistant(chat.id);
                          const next: Message = {
                            id: uid(),
                            role: "assistant",
                            content: "",
                            modelId: model.id,
                            createdAt: Date.now(),
                          };
                          appendMessage(chat.id, next);
                          setStreamingId(next.id);
                          streamReply(chat.id, next.id, previousUser.content, model.id);
                        }}
                      >
                        Regenerate
                      </button>
                    </div>
                  ) : null}
                </article>
              </li>
            ))}
          </ol>
          <p className="sr-only" aria-live="polite">
            {streamingId ? "EchoGPT is writing a reply." : ""}
          </p>
        </div>
      </div>
      {inThread ? (
        <div className="shrink-0 bg-bg px-4 py-4">
          <div className="mx-auto max-w-3xl">{composer}</div>
        </div>
      ) : null}
      <ModelDialog
        open={modelOpen}
        selectedId={model.id}
        plan={plan}
        onClose={() => setModelOpen(false)}
        onSelect={(next: Model) => {
          setModelId(next.id);
          setModelOpen(false);
          notify(`${next.name} selected`);
        }}
        onLocked={() => {
          setModelOpen(false);
          setUpgradeOpen(true);
        }}
      />
      <Dialog
        open={upgradeOpen}
        title="Free message limit"
        description="Free includes 20 messages, then resets every 5 hours. Plus unlocks advanced models. Cancelling Plus does not refund the current period."
        onClose={() => setUpgradeOpen(false)}
      >
        <div className="flex flex-wrap gap-2">
          <Link href="/pricing" className="inline-flex h-11 items-center rounded-xl bg-primary px-4 text-sm font-medium text-white">
            View plans
          </Link>
          <button type="button" className="h-11 rounded-xl px-4 text-sm text-muted hover:bg-soft" onClick={() => setUpgradeOpen(false)}>
            Keep going later
          </button>
        </div>
      </Dialog>
      <Dialog open={shareOpen} title="Share this chat" description="Copy the transcript. It stays on this device until you paste it somewhere else." onClose={() => setShareOpen(false)}>
        <button type="button" className="h-11 rounded-xl bg-primary px-4 text-sm font-medium text-white" onClick={copyTranscript}>
          Copy transcript
        </button>
      </Dialog>
    </div>
  );
}
