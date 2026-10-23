"use client";

import { useEffect, useState } from "react";
import { announceMemoryReset } from "@/lib/memory/browser-events";

type Status = { state: "unconfigured" | "new" | "ready" | "unavailable"; count: number };

async function loadStatus(signal?: AbortSignal): Promise<Status> {
