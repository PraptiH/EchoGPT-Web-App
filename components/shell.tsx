"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/lib/store";
import { formatWhen } from "@/lib/utils";
import { CommandPalette } from "./command-palette";
import { Icon } from "./icon";

const primaryNav = [
  { href: "/", label: "Chat", icon: "chat" },
  { href: "/image", label: "Create", icon: "image" },
  { href: "/tasks", label: "Workflows", icon: "tasks" },
] as const;

const pageNames: Record<string, string> = {
  "/": "Home",
  "/compare": "Compare",
  "/image": "Create",
  "/video": "Video",
  "/jobs": "Job insight",
  "/sop": "Statement of purpose",
  "/tasks": "Workflows",
  "/store": "Store",
  "/connectors": "Connectors",
  "/history": "History",
  "/pricing": "Pricing",
  "/account": "Account",
  "/support": "Support",
  "/privacy": "Privacy",
  "/terms": "Terms",
};

function RecentChats({ collapsed }: { collapsed: boolean }) {
  const params = useSearchParams();
  const router = useRouter();
  const { chats, deleteChat, notify } = useApp();
  const activeChat = params.get("chat");

  if (collapsed) return null;

  if (chats.length === 0) {
    return (
      <ul className="flex flex-col gap-0.5">
        {["Campaign brief directions", "Q3 research synthesis", "Onboarding email sequence", "Pricing page critique"].map(
          (title) => (
            <li key={title}>
              <Link
                href={`/?prompt=${encodeURIComponent(title)}&new=${title.length}`}
                className="block truncate rounded-lg px-2 py-1.5 text-[13px] text-muted hover:bg-white/70 hover:text-fg"
              >
                {title}
              </Link>
            </li>
          ),
        )}
      </ul>
    );
  }

  return (
    <ul className="thin-scroll flex max-h-48 flex-col gap-0.5 overflow-y-auto">
      {chats.slice(0, 6).map((chat) => (
        <li key={chat.id} className="group flex items-center gap-1">
          <Link
            href={`/?chat=${chat.id}`}
            title={formatWhen(chat.updatedAt)}
            className={`min-w-0 flex-1 truncate rounded-lg px-2 py-1.5 text-[13px] hover:bg-white/70 hover:text-ink ${activeChat === chat.id ? "bg-white font-medium text-ink" : "text-muted"}`}
          >
            {chat.title}
          </Link>
          <button
            type="button"
            aria-label={`Delete ${chat.title}`}
            className="rounded-md p-1 text-muted opacity-0 hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
            onClick={() => {
              deleteChat(chat.id);
              notify("Chat deleted");
              if (activeChat === chat.id) router.push(`/?new=${Date.now()}`);
            }}
          >
            <Icon name="trash" size={14} />
          </button>
        </li>
      ))}
    </ul>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { quota, plan, theme, setTheme, user } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pageName = pageNames[pathname] ?? "Workspace";
  const limit = plan === "plus" ? 200 : 20;
  const used = Math.max(0, Math.min(100, Math.round(((limit - quota.remaining) / limit) * 100)));
  const displayName = user?.name ?? "Sign in";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const sidebar = (
    <div className="flex h-full flex-col px-3 py-3">
      <div className={`flex items-center gap-2 ${collapsed ? "flex-col justify-center" : ""}`}>
        <button
          type="button"
          onClick={() => router.push(`/?new=${Date.now()}`)}
          className={`inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-white hover:bg-[var(--primary-hover)] ${collapsed ? "w-10 px-0" : "min-w-0 flex-1 px-4"}`}
        >
          <Icon name="plus" size={16} />
          {collapsed ? <span className="sr-only">New chat</span> : "New chat"}
        </button>
        <button
          type="button"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-muted hover:bg-white/70 hover:text-fg"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed((value) => !value)}
        >
          <Icon name="panel" size={16} />
        </button>
      </div>
      <nav aria-label="Workspace" className="mt-3 flex flex-col gap-0.5">
        {primaryNav.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              title={item.label}
              className={`flex h-10 items-center gap-2.5 rounded-xl px-2.5 text-sm ${active ? "bg-white font-medium text-ink shadow-[0_1px_2px_rgba(30,20,60,0.08)]" : "text-muted hover:bg-white/70 hover:text-ink"} ${collapsed ? "justify-center px-0" : ""}`}
            >
              <span className={`grid h-6 w-6 place-items-center ${active ? "text-primary" : ""}`}>
                <Icon name={item.icon} size={18} />
              </span>
              {collapsed ? <span className="sr-only">{item.label}</span> : item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 min-h-0 flex-1">
        {collapsed ? null : (
          <h2 className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Recent</h2>
        )}
        <Suspense fallback={<p className="px-2 text-xs text-muted">Loading chats…</p>}>
          <RecentChats collapsed={collapsed} />
        </Suspense>
      </div>
      <div className={`mt-3 rounded-2xl bg-white p-3 text-ink ${collapsed ? "px-2" : ""}`}>
        <div className="flex items-center justify-between gap-2 text-xs font-medium">
          <span className="truncate">{plan === "plus" ? "Pro plan" : "Free plan"}</span>
          {collapsed ? null : <span className="text-[#6f6a7a]">{used}%</span>}
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-soft"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={used}
          aria-label="Plan usage"
        >
          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(used, 4)}%` }} />
        </div>
      </div>
      <div className={`mt-3 flex items-center text-muted ${collapsed ? "flex-col gap-1" : "justify-between px-1"}`}>
        <Link href="/support" className="rounded-lg p-1.5 hover:bg-white/70 hover:text-fg" aria-label="Support" title="Support">
          <Icon name="chat" size={16} />
        </Link>
        <Link href="/login" className="rounded-lg p-1.5 hover:bg-white/70 hover:text-fg" aria-label="Sign in" title="Sign in">
          <Icon name="plug" size={16} />
        </Link>
        <Link href="/support" className="rounded-lg p-1.5 hover:bg-white/70 hover:text-fg" aria-label="Discord" title="Discord">
          <Icon name="grid" size={16} />
        </Link>
        <Link href="/connectors" className="rounded-lg p-1.5 hover:bg-white/70 hover:text-fg" aria-label="API" title="API">
          <Icon name="settings" size={16} />
        </Link>
        <button
          type="button"
          className="rounded-lg p-1.5 hover:bg-white/70 hover:text-fg"
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          title="Theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
        </button>
      </div>
      <Link
        href={user ? "/account" : "/login"}
        className={`mt-3 flex items-center gap-2 rounded-xl px-1 py-1.5 hover:bg-white/70 ${collapsed ? "justify-center" : ""}`}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
          {displayName.slice(0, 1).toUpperCase()}
        </span>
        {collapsed ? null : (
          <>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{displayName}</span>
            <Icon name="chevron" size={16} className="text-muted" />
          </>
        )}
      </Link>
      <button type="button" className="mt-2 text-xs text-muted lg:hidden" onClick={() => setMobileOpen(false)}>
        Close menu
      </button>
    </div>
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg text-fg">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line bg-elev px-3 sm:px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight" aria-label="EchoGPT home">
          <img src="/assets/images/logo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-lg" />
          <span className="hidden sm:inline">EchoGPT</span>
        </Link>
        <span className="hidden h-8 w-px bg-line sm:block" />
        <div className="hidden min-w-0 sm:block">
          <p className="text-[11px] leading-none text-muted">AI workspace</p>
          <p className="mt-1 text-sm font-semibold leading-none">{pageName}</p>
        </div>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="hidden h-10 w-full max-w-xs items-center gap-2 rounded-full border border-line bg-bg px-3 text-sm text-muted hover:text-fg md:flex"
        >
          <Icon name="search" size={16} />
          <span className="flex-1 text-left">Search anything...</span>
          <kbd className="rounded-md border border-line bg-elev px-1.5 py-0.5 text-[10px]">Ctrl K</kbd>
        </button>
        <button
          type="button"
          onClick={() => router.push(`/?new=${Date.now()}`)}
          className="hidden h-10 shrink-0 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-white hover:bg-[var(--primary-hover)] lg:inline-flex"
        >
          <Icon name="plus" size={16} />
          New workspace
        </button>
        <button
          type="button"
          className="rounded-lg p-2 text-muted hover:bg-soft lg:hidden"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <Icon name="menu" />
        </button>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className={`hidden shrink-0 border-r border-line bg-sidebar lg:block ${collapsed ? "w-[76px]" : "w-[248px]"}`}>
          {sidebar}
        </aside>
        {mobileOpen ? (
          <div className="fixed inset-0 z-30 lg:hidden">
            <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-[min(100%,18rem)] bg-sidebar shadow-[var(--shadow)]">{sidebar}</aside>
          </div>
        ) : null}
        <main id="main" className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
          <div className="absolute inset-0 [&>*]:h-full">{children}</div>
        </main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
