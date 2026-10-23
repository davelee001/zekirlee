"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MEMORY_RESET_EVENT, MEMORY_RESET_KEY } from "@/lib/memory/browser-events";

export function useMemoryStorage() {
  const [enabled, setEnabled] = useState(false);
  const [notice, setNotice] = useState("");
  const [recallNotice, setRecallNotice] = useState("");
  const queue = useRef(Promise.resolve());
  const optedIn = useRef(false);
  const generation = useRef(0);

  useEffect(() => {
    const reset = () => {
      optedIn.current = false;
      generation.current++;
      setEnabled(false);
      setRecallNotice("");
      setNotice("Memory was paused from Settings. Re-enable it when you want to use and save details again.");
    };
    const storage = (event: StorageEvent) => { if (event.key === MEMORY_RESET_KEY) reset(); };
    window.addEventListener(MEMORY_RESET_EVENT, reset);
    window.addEventListener("storage", storage);
    return () => {
      optedIn.current = false;
      // Invalidate the latest queued work, not the generation captured on mount.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      generation.current++;
      window.removeEventListener(MEMORY_RESET_EVENT, reset);
      window.removeEventListener("storage", storage);
    };
  }, []);

  function toggle(value: boolean) {
    optedIn.current = value;
    generation.current++;
    setEnabled(value);
    setRecallNotice("");
    setNotice(value ? "Replies can use saved details, and new messages can save preferences, goals, and project details." : "Memory is off. Previously saved details remain stored.");
  }

  function reportRecall(status: string | null, count: string | null) {
    if (!optedIn.current) return;
    setRecallNotice(status === "recalled" ? `${Number(count) || 0} saved details supplied as context for this reply.`
      : status === "unavailable" ? "Saved memory is unavailable. This reply uses the current conversation."
      : status === "new" ? "No memory identity found in this browser yet."
      : status === "empty" ? "No relevant saved details found for this reply." : "");
  }

  function save(text: string) {
    if (!optedIn.current) return;
    const version = generation.current;
    queue.current = queue.current.then(async () => {
      if (!optedIn.current || generation.current !== version) return;
      setNotice("Finding useful details to remember...");
      try {
        const send = () => fetch("/api/memory", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ consent: true, text }), signal: AbortSignal.timeout(55000),
        });
        let response = await send();
        let result = await response.json();
        if (response.status === 409 && result.code === "MEMORY_SESSION_CREATED") {
          if (!optedIn.current || generation.current !== version) return;
          response = await send();
          result = await response.json();
        }
        if (!response.ok) throw new Error(result.error || "Memory could not be saved.");
        if (generation.current !== version) return;
        setNotice(result.failed
          ? `${result.saved} details confirmed saved; ${result.failed} could not be confirmed and may still finish.`
          : result.saved ? `${result.saved} useful detail${result.saved === 1 ? "" : "s"} saved to Walrus.`
          : "No suitable new details to save from this message.");
      } catch (error) {
        if (generation.current !== version) return;
        setNotice(error instanceof Error && error.name !== "TimeoutError" ? error.message : "Memory storage timed out. A submitted job may still finish; your chat is unaffected.");
      }
    });
  }

  return { enabled, notice, recallNotice, toggle, save, reportRecall };
}

export function MemoryStorageControl({ enabled, notice, recallNotice, toggle }: {
  enabled: boolean; notice: string; recallNotice: string; toggle: (enabled: boolean) => void;
}) {
  return <div className="memory-storage-control">
    <label><input type="checkbox" checked={enabled} onChange={event => toggle(event.target.checked)} /> Use and save memory with Walrus</label>
    <small>Optional memory, linked to this browser. Relevant saved details are sent to the AI provider for replies. Turning it off stops future recall and saves; stored details remain.</small>
    <Link href="/settings#saved-memory">Manage saved memory</Link>
    {recallNotice && <span role="status">{recallNotice}</span>}
    {notice && <span role="status">{notice}</span>}
  </div>;
}
