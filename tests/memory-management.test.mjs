import assert from "node:assert/strict";
import { createHash, createPublicKey, verify } from "node:crypto";
import test from "node:test";
import { createMemoryManagementHandlers } from "../src/lib/memory/management.ts";
import { memoryAdminRequest } from "../src/lib/memory/relayer-admin.ts";

const url = "https://zekirlee.example/api/memory/manage";
const request = (method, headers = {}) => new Request(url, { method, headers });
const confirmed = { origin: "https://zekirlee.example", "x-zekirlee-confirm": "forget-memory" };
