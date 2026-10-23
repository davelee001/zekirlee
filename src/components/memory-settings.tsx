"use client";

import { useEffect, useState } from "react";
import { announceMemoryReset } from "@/lib/memory/browser-events";

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
