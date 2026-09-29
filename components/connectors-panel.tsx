"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { ghostBtn, primaryBtn } from "./styles";

export function ConnectorsPanel() {
  const { connectors, addConnector, toggleConnector, removeConnector, refreshConnector, notify } = useApp();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [auth, setAuth] = useState("");
  const [error, setError] = useState("");

  function submit() {
    if (name.trim().length < 2 || !/^https?:\/\//i.test(url.trim())) {
      setError("Add a name and a URL that starts with http:// or https://.");
      return;
    }
    setError("");
    addConnector({ name, url, authHeader: auth });
    setName("");
    setUrl("");
    setAuth("");
    notify("Connector saved on this device");
  }

  return (
    <div className="thin-scroll mx-auto flex h-full w-full max-w-3xl flex-col gap-6 overflow-y-auto px-4 py-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Connectors</h1>
        <p className="mt-1 text-sm text-muted">
          Save an MCP server, then mention it in chat with @. Only connect servers you trust. Their tools can act for you.
        </p>
      </header>
      <form
        className="grid gap-3 rounded-2xl border border-line bg-elev p-4"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div>
          <label htmlFor="connector-name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="connector-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Shown in the list and after @"
            className="mt-2 h-11 w-full rounded-xl border border-line bg-bg px-3 text-base"
          />
        </div>
        <div>
          <label htmlFor="connector-url" className="text-sm font-medium">
            Server URL
          </label>
          <input
            id="connector-url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/mcp"
            inputMode="url"
            className="mt-2 h-11 w-full rounded-xl border border-line bg-bg px-3 text-base"
          />
        </div>
        <div>
          <label htmlFor="connector-auth" className="text-sm font-medium">
            Authorization header <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="connector-auth"
            value={auth}
            onChange={(event) => setAuth(event.target.value)}
            placeholder="Bearer …"
            autoComplete="off"
            className="mt-2 h-11 w-full rounded-xl border border-line bg-bg px-3 text-base"
          />
        </div>
        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className={`${primaryBtn} justify-self-start`}>
          Add connector
        </button>
      </form>
      {connectors.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
          No connectors yet. Add a server above, then type @ in chat to use its tools.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {connectors.map((connector) => (
            <li key={connector.id} className="rounded-2xl border border-line bg-elev p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold">{connector.name}</h2>
                  <p className="truncate text-xs text-muted">{connector.url}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    aria-pressed={connector.enabled}
                    className={ghostBtn}
                    onClick={() => toggleConnector(connector.id)}
                  >
                    {connector.enabled ? "Enabled" : "Disabled"}
                  </button>
                  <button
                    type="button"
                    className={ghostBtn}
                    onClick={() => {
                      refreshConnector(connector.id);
                      notify("Tools refreshed");
                    }}
                  >
                    Refresh tools
                  </button>
                  <button
                    type="button"
                    className="h-11 rounded-xl px-3 text-sm text-danger hover:bg-soft"
                    onClick={() => {
                      removeConnector(connector.id);
                      notify("Connector removed");
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <ul className="mt-3 flex flex-wrap gap-2">
                {connector.tools.length === 0 ? (
                  <li className="text-xs text-muted">No tools reported. Try refreshing.</li>
                ) : (
                  connector.tools.map((tool) => (
                    <li key={tool} className="rounded-lg bg-soft px-2 py-1 text-xs">
                      {tool}
                    </li>
                  ))
                )}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
