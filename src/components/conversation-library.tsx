"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SIGNED_OUT_EVENT, useAccount } from "@/hooks/use-account";
import { restoreMessages, SESSION_KEY } from "@/lib/ai/session";
import type { ConversationSummary } from "@/lib/conversations/handler";

export function ConversationLibrary() {
  const account = useAccount();
  const [listing, setListing] = useState<{ owner: string; rows: ConversationSummary[]; hasMore: boolean } | null>(null);
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<{ id: string; action: "open" | "delete" } | null>(null);
  const userId = account.user?.id;
  const operation = useRef({ generation: 0, controller: null as AbortController | null });

  useEffect(() => {
    const current = operation.current;
    const cancel = () => { current.generation++; current.controller?.abort(); };
    const signedOut = () => { cancel(); setConfirm(null); setBusy(false); };
    window.addEventListener(SIGNED_OUT_EVENT, signedOut);
    return () => { cancel(); window.removeEventListener(SIGNED_OUT_EVENT, signedOut); };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    fetch(`/api/conversations?page=${page}`, { signal: controller.signal, cache: "no-store" }).then(async response => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Saved conversations are unavailable.");
      if (!controller.signal.aborted) { setListing({ owner: userId, rows: result.conversations, hasMore: result.hasMore }); setNotice(""); setBusy(false); }
    }).catch(error => { if (!controller.signal.aborted) setNotice(error.message); });
    return () => controller.abort();
  }, [userId, page, revision]);

  async function perform() {
    if (!confirm || busy || !userId) return;
    const generation = operation.current.generation;
    const controller = new AbortController();
    operation.current.controller = controller;
    setBusy(true); setNotice("");
    try {
      const response = await fetch(`/api/conversations/${confirm.id}`, {
        method: confirm.action === "delete" ? "DELETE" : "GET",
        headers: confirm.action === "delete" ? { "X-Zekirlee-Confirm": "delete-conversation" } : {},
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20000)]), cache: "no-store",
      });
