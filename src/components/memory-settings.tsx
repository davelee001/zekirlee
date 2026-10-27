"use client";

import { useEffect, useState } from "react";
import { announceMemoryReset } from "@/lib/memory/browser-events";
import { useAccount } from "@/hooks/use-account";

type Status = { state: "unconfigured" | "new" | "ready" | "unavailable"; count: number };

async function loadStatus(signal?: AbortSignal): Promise<Status> {
  const response = await fetch("/api/memory/manage", {
    cache: "no-store", signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(45000)]) : AbortSignal.timeout(45000),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Memory status is unavailable.");
  return result;
}

export function MemorySettings() {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const [notice, setNotice] = useState("");

  async function refresh(signal?: AbortSignal) {
    try {
      setStatus(await loadStatus(signal));
    } catch (error) {
      if (signal?.aborted) return;
      setStatus({ state: "unavailable", count: 0 });
      setNotice(error instanceof Error ? error.message : "Memory status is unavailable.");
    } finally { if (!signal?.aborted) setBusy(false); }
  }

  useEffect(() => {
    const controller = new AbortController();
    loadStatus(controller.signal).then(result => {
      if (!controller.signal.aborted) setStatus(result);
    }).catch(() => {
      if (!controller.signal.aborted) {
        setStatus({ state: "unavailable", count: 0 });
        setNotice("Saved memory could not be checked. Use Refresh status to try again.");
      }
    }).finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, []);

  async function clearMemory() {
    setBusy(true);
    setConfirm(false);
    setNotice("Clearing searchable memory...");
    announceMemoryReset();
    try {
      const response = await fetch("/api/memory/manage", {
        method: "DELETE", headers: { "X-Zekirlee-Confirm": "forget-memory" }, signal: AbortSignal.timeout(55000),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Clearing memory could not be confirmed.");
      setStatus({ state: "new", count: 0 });
      setNotice(`${result.cleared} searchable memories cleared. Future memory uses a fresh space. Encrypted Walrus blobs remain until expiry; your chat history is unchanged.`);
      announceMemoryReset();
    } catch (error) {
      setNotice(error instanceof Error && error.name !== "TimeoutError" ? error.message : "Clearing memory timed out. Refresh the status before retrying; the request may still finish.");
    } finally { setBusy(false); }
  }

  return <section className="workspace-card" id="saved-memory">
    <h2>Saved memory</h2>
    <p>Manage the Walrus memory linked to this browser. Chat history and saved memory are separate.</p>
    <p role="status">{busy ? "Checking or updating memory..." : status?.state === "ready" ? `${status.count} searchable memories linked to this browser.`
      : status?.state === "new" ? "No previous memory space is linked to this browser."
      : status?.state === "unconfigured" ? "Walrus memory is not configured. Chat is still available."
      : "Memory is currently unavailable."}</p>
    {confirm ? <div className="memory-confirmation">
      <p>Clear this browser&apos;s searchable memories? They will stop appearing in future replies. Encrypted blobs remain on Walrus until expiry and may be restored by the account operator. Chat history will stay.</p>
      <div className="workspace-actions"><button disabled={busy} onClick={() => void clearMemory()}>Confirm clear memory</button><button disabled={busy} onClick={() => setConfirm(false)}>Cancel</button></div>
    </div> : <div className="workspace-actions">
      <button disabled={busy || status?.state !== "ready"} onClick={() => setConfirm(true)}>Clear saved memory</button>
      <button disabled={busy} onClick={() => { setBusy(true); setNotice(""); void refresh(); }}>Refresh status</button>
    </div>}
    <p>Clearing pauses memory in open tabs when browser storage is available. Already submitted writes may finish in the old space; future requests use a new one. Re-enable memory in chat when you want to save new details.</p>
    {notice && <p role="status">{notice}</p>}
  </section>;
}
