"use client";
import Link from "next/link";
import { useState } from "react";
import { useAccount } from "@/hooks/use-account";
import { serializeChatRequest, type SessionMessage } from "@/lib/ai/session";

export function SaveConversation({ messages, disabled }: { messages: SessionMessage[]; disabled: boolean }) {
  const account = useAccount();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  async function save() {
    if (busy || disabled || !messages.length) return;
    setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/conversations", { method: "POST", headers: { "Content-Type": "application/json" },
        body: serializeChatRequest(messages), signal: AbortSignal.timeout(20000) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Conversation could not be saved.");
      setNotice("Snapshot saved to your account.");
    } catch (error) {
      setNotice(error instanceof Error && error.name !== "TimeoutError" ? error.message : "Saving timed out. Check Saved chats before retrying; the snapshot may have been saved.");
