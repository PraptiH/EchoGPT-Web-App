"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { defaultModelId, FREE_QUOTA } from "./data";

export type Plan = "free" | "plus";
export type ThemeMode = "light" | "dark";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  modelId?: string;
  attachmentName?: string;
  createdAt: number;
};

export type Chat = {
  id: string;
  title: string;
  modelId: string;
  messages: Message[];
  updatedAt: number;
};

export type Connector = {
  id: string;
  name: string;
  url: string;
  authHeader?: string;
  enabled: boolean;
  tools: string[];
};

export type Creation = {
  id: string;
  prompt: string;
  modelName: string;
  meta: string;
  createdAt: number;
  hue: number;
};

export type JobRecord = {
  id: string;
  title: string;
  excerpt: string;
  createdAt: number;
};

export type User = {
  name: string;
  email: string;
  provider: string;
} | null;

type Quota = { remaining: number; resetAt: number };

type Persisted = {
  plan: Plan;
  user: User;
  chats: Chat[];
  connectors: Connector[];
  images: Creation[];
  videos: Creation[];
  jobs: JobRecord[];
  quota: Quota;
  modelId: string;
};

type AppContextValue = Persisted & {
  ready: boolean;
  theme: ThemeMode;
  toast: string | null;
  notify: (message: string) => void;
  setTheme: (theme: ThemeMode) => void;
  signIn: (user: Exclude<User, null>) => void;
  signOut: () => void;
  setPlan: (plan: Plan) => void;
  setModelId: (modelId: string) => void;
  ensureChat: (modelId: string) => string;
  beginTurn: (
    chatId: string | null,
    modelId: string,
    userMessage: Message,
    assistantMessage: Message,
  ) => string;
  appendMessage: (chatId: string, message: Message) => void;
  replaceMessage: (chatId: string, messageId: string, content: string) => void;
  removeLastAssistant: (chatId: string) => void;
  revertTurn: (chatId: string, messageIds: string[]) => void;
  deleteChat: (chatId: string) => void;
  consumeQuota: () => boolean;
  addConnector: (input: { name: string; url: string; authHeader?: string }) => void;
  toggleConnector: (id: string) => void;
  removeConnector: (id: string) => void;
  refreshConnector: (id: string) => void;
  addCreation: (kind: "images" | "videos", item: Creation) => void;
  removeCreation: (kind: "images" | "videos", id: string) => void;
  addJob: (job: JobRecord) => void;
  removeJob: (id: string) => void;
};

const STORAGE_KEY = "echogpt-workspace";
const THEME_KEY = "echogpt-theme";

const AppContext = createContext<AppContextValue | null>(null);

function freshQuota(): Quota {
  return { remaining: FREE_QUOTA, resetAt: Date.now() + 5 * 60 * 60 * 1000 };
}

const emptyState: Persisted = {
  plan: "free",
  user: null,
  chats: [],
  connectors: [],
  images: [],
  videos: [],
  jobs: [],
  quota: { remaining: FREE_QUOTA, resetAt: 0 },
  modelId: defaultModelId,
};

function normalize(raw: Partial<Persisted> | null): Persisted {
  if (!raw) return { ...emptyState, quota: freshQuota() };
  const quota =
    raw.quota && raw.quota.resetAt > Date.now() ? raw.quota : freshQuota();
  return {
    plan: raw.plan === "plus" ? "plus" : "free",
    user: raw.user ?? null,
    chats: Array.isArray(raw.chats) ? raw.chats.slice(0, 40) : [],
    connectors: Array.isArray(raw.connectors) ? raw.connectors : [],
    images: Array.isArray(raw.images) ? raw.images.slice(0, 24) : [],
    videos: Array.isArray(raw.videos) ? raw.videos.slice(0, 24) : [],
    jobs: Array.isArray(raw.jobs) ? raw.jobs.slice(0, 24) : [],
    quota,
    modelId: raw.modelId || defaultModelId,
  };
}

export function Providers({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(emptyState);
  const [ready, setReady] = useState(false);
  const quotaRef = useRef(state.quota);
  const planRef = useRef(state.plan);
  quotaRef.current = state.quota;
  planRef.current = state.plan;
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_KEY);
    const fromDom = document.documentElement.dataset.theme;
    const nextTheme: ThemeMode =
      storedTheme === "light" || storedTheme === "dark"
        ? storedTheme
        : fromDom === "light"
          ? "light"
          : "dark";
    document.documentElement.dataset.theme = nextTheme;
    setThemeState(nextTheme);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setState(normalize(raw ? (JSON.parse(raw) as Partial<Persisted>) : null));
    } catch {
      setState(normalize(null));
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2800);
  }, []);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem(THEME_KEY, next);
  }, []);

  const signIn = useCallback((user: Exclude<User, null>) => {
    setState((current) => ({ ...current, user }));
  }, []);

  const signOut = useCallback(() => {
    const quota = freshQuota();
    planRef.current = "free";
    quotaRef.current = quota;
    setState((current) => ({ ...current, user: null, plan: "free", quota }));
  }, []);

  const setPlan = useCallback((plan: Plan) => {
    const quota =
      plan === "plus"
        ? { remaining: 200, resetAt: Date.now() + 30 * 24 * 60 * 60 * 1000 }
        : freshQuota();
    planRef.current = plan;
    quotaRef.current = quota;
    setState((current) => ({ ...current, plan, quota }));
  }, []);

  const setModelId = useCallback((modelId: string) => {
    setState((current) => ({ ...current, modelId }));
  }, []);

  const ensureChat = useCallback((modelId: string) => {
    const id = Math.random().toString(36).slice(2, 10);
    setState((current) => ({
      ...current,
      chats: [
        {
          id,
          title: "New chat",
          modelId,
          messages: [],
          updatedAt: Date.now(),
        },
        ...current.chats,
      ],
    }));
    return id;
  }, []);

  const beginTurn = useCallback(
    (chatId: string | null, modelId: string, userMessage: Message, assistantMessage: Message) => {
      const id = chatId ?? Math.random().toString(36).slice(2, 10);
      const title = userMessage.content.replace(/\s+/g, " ").trim().slice(0, 48) || "New chat";
      setState((current) => {
        const existing = current.chats.some((chat) => chat.id === id);
        if (!existing) {
          return {
            ...current,
            chats: [
              {
                id,
                title,
                modelId,
                messages: [userMessage, assistantMessage],
                updatedAt: Date.now(),
              },
              ...current.chats,
            ],
          };
        }
        return {
          ...current,
          chats: current.chats.map((chat) =>
            chat.id === id
              ? {
                  ...chat,
                  title: chat.title === "New chat" ? title : chat.title,
                  messages: [...chat.messages, userMessage, assistantMessage],
                  updatedAt: Date.now(),
                }
              : chat,
          ),
        };
      });
      return id;
    },
    [],
  );

  const appendMessage = useCallback((chatId: string, message: Message) => {
    setState((current) => ({
      ...current,
      chats: current.chats.map((chat) => {
        if (chat.id !== chatId) return chat;
        const title =
          chat.title === "New chat" && message.role === "user"
            ? message.content.replace(/\s+/g, " ").trim().slice(0, 48) || "New chat"
            : chat.title;
        return {
          ...chat,
          title,
          messages: [...chat.messages, message],
          updatedAt: Date.now(),
        };
      }),
    }));
  }, []);

  const replaceMessage = useCallback(
    (chatId: string, messageId: string, content: string) => {
      setState((current) => ({
        ...current,
        chats: current.chats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                updatedAt: Date.now(),
                messages: chat.messages.map((message) =>
                  message.id === messageId ? { ...message, content } : message,
                ),
              }
            : chat,
        ),
      }));
    },
    [],
  );

  const revertTurn = useCallback((chatId: string, messageIds: string[]) => {
    const drop = new Set(messageIds);
    setState((current) => ({
      ...current,
      chats: current.chats.flatMap((chat) => {
        if (chat.id !== chatId) return [chat];
        const messages = chat.messages.filter((message) => !drop.has(message.id));
        if (messages.length === 0) return [];
        return [{ ...chat, messages, updatedAt: Date.now() }];
      }),
    }));
  }, []);

  const removeLastAssistant = useCallback((chatId: string) => {
    setState((current) => ({
      ...current,
      chats: current.chats.map((chat) => {
        if (chat.id !== chatId) return chat;
        const messages = [...chat.messages];
        for (let i = messages.length - 1; i >= 0; i -= 1) {
          if (messages[i].role === "assistant") {
            messages.splice(i, 1);
            break;
          }
        }
        return { ...chat, messages, updatedAt: Date.now() };
      }),
    }));
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    setState((current) => ({
      ...current,
      chats: current.chats.filter((chat) => chat.id !== chatId),
    }));
  }, []);

  const consumeQuota = useCallback(() => {
    const plan = planRef.current;
    let quota = quotaRef.current;
    if (plan !== "plus" && quota.resetAt <= Date.now()) {
      quota = freshQuota();
      quotaRef.current = quota;
    }
    if (quota.remaining <= 0) {
      quotaRef.current = quota;
      setState((current) => ({ ...current, quota }));
      return false;
    }
    const next = { ...quota, remaining: quota.remaining - 1 };
    quotaRef.current = next;
    setState((current) => ({ ...current, quota: next }));
    return true;
  }, []);

  const addConnector = useCallback(
    (input: { name: string; url: string; authHeader?: string }) => {
      setState((current) => ({
        ...current,
        connectors: [
          {
            id: Math.random().toString(36).slice(2, 10),
            name: input.name.trim(),
            url: input.url.trim(),
            authHeader: input.authHeader?.trim() || undefined,
            enabled: true,
            tools: ["search", "summarize"],
          },
          ...current.connectors,
        ],
      }));
    },
    [],
  );

  const toggleConnector = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      connectors: current.connectors.map((connector) =>
        connector.id === id
          ? { ...connector, enabled: !connector.enabled }
          : connector,
      ),
    }));
  }, []);

  const removeConnector = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      connectors: current.connectors.filter((connector) => connector.id !== id),
    }));
  }, []);

  const refreshConnector = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      connectors: current.connectors.map((connector) =>
        connector.id === id
          ? { ...connector, tools: ["search", "summarize", "create"] }
          : connector,
      ),
    }));
  }, []);

  const addCreation = useCallback(
    (kind: "images" | "videos", item: Creation) => {
      setState((current) => ({
        ...current,
        [kind]: [item, ...current[kind]].slice(0, 24),
      }));
    },
    [],
  );

  const removeCreation = useCallback(
    (kind: "images" | "videos", id: string) => {
      setState((current) => ({
        ...current,
        [kind]: current[kind].filter((item) => item.id !== id),
      }));
    },
    [],
  );

  const addJob = useCallback((job: JobRecord) => {
    setState((current) => ({ ...current, jobs: [job, ...current.jobs].slice(0, 24) }));
  }, []);

  const removeJob = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      jobs: current.jobs.filter((job) => job.id !== id),
    }));
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      ready,
      theme,
      toast,
      notify,
      setTheme,
      signIn,
      signOut,
      setPlan,
      setModelId,
      ensureChat,
      beginTurn,
      appendMessage,
      replaceMessage,
      removeLastAssistant,
      revertTurn,
      deleteChat,
      consumeQuota,
      addConnector,
      toggleConnector,
      removeConnector,
      refreshConnector,
      addCreation,
      removeCreation,
      addJob,
      removeJob,
    }),
    [
      state,
      ready,
      theme,
      toast,
      notify,
      setTheme,
      signIn,
      signOut,
      setPlan,
      setModelId,
      ensureChat,
      beginTurn,
      appendMessage,
      replaceMessage,
      removeLastAssistant,
      revertTurn,
      deleteChat,
      consumeQuota,
      addConnector,
      toggleConnector,
      removeConnector,
      refreshConnector,
      addCreation,
      removeCreation,
      addJob,
      removeJob,
    ],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-20 left-1/2 z-50 w-[min(100%-2rem,24rem)] -translate-x-1/2 md:bottom-6">
        {toast ? (
          <p
            role="status"
            className="pointer-events-auto rounded-xl border border-line bg-elev px-4 py-3 text-sm text-fg shadow-[var(--shadow)]"
          >
            {toast}
          </p>
        ) : (
          <span className="sr-only" role="status">
            {toast}
          </span>
        )}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within Providers");
  return context;
}
