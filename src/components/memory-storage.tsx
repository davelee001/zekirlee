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

