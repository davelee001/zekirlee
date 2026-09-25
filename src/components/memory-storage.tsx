"use client";

import { useRef, useState } from "react";

export function useMemoryStorage() {
  const [enabled, setEnabled] = useState(false);
  const [notice, setNotice] = useState("");
  const queue = useRef(Promise.resolve());
  const optedIn = useRef(false);

  function toggle(value: boolean) {
    optedIn.current = value;
    setEnabled(value);
    setNotice(value ? "New messages can save preferences, goals, and project details." : "Memory is off. Previously saved details remain stored.");
  }

  function save(text: string) {
    if (!optedIn.current) return;
    queue.current = queue.current.then(async () => {
      if (!optedIn.current) return;
      setNotice("Finding useful details to remember...");
      try {
        const send = () => fetch("/api/memory", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ consent: true, text }), signal: AbortSignal.timeout(55000),
        });
        let response = await send();
        let result = await response.json();
        if (response.status === 409 && result.code === "MEMORY_SESSION_CREATED") {
          if (!optedIn.current) return;
          response = await send();
          result = await response.json();
