import assert from "node:assert/strict";
import test from "node:test";
import { createConversationHandler } from "../src/lib/conversations/handler.ts";
import { completeEmailLink } from "../src/lib/auth/email-link.ts";

const origin = "https://zekirlee.example";
const id = "2caf5d08-d16b-418b-bd4c-939c62d4959f";
