# Zekirlee

Zekirlee is a conversational AI workspace focused on Sui. Users can ask questions, receive streamed answers, and continue a conversation without connecting a wallet or signing in.

## Current features

- Real AI responses through the Vercel AI SDK, with Google Gemini and OpenAI provider options.
- Progressive replies that preserve the reader's scroll position.
- Markdown formatting for headings, bold, italics, lists, links, quotes, code, and tables.
- A connected conversation panel with replies above the input and an inline send button.
- Light assistant bubbles and darker user bubbles.
- Conversation history retained across refreshes in the current browser tab.
- Full session context sent with follow-up questions, within explicit request limits.
- A **New conversation** button that clears the current history.
- Loading, configuration, storage, and interrupted-response feedback.

Wallet connection, live blockchain retrieval, login screens, and persistent Walrus memory are not implemented in the chat flow. Supabase and Walrus client helpers are available for future integration.

## Technology

| Area | Technology |
| --- | --- |
| Application | Next.js App Router, React, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| AI | Vercel AI SDK, Google Gemini, OpenAI |
| Response formatting | react-markdown, remark-gfm |
| Session storage | Browser sessionStorage |
| Auth and database helpers | Supabase Auth and PostgreSQL |
| Persistent memory helper | Walrus Memory SDK, configured for a Mainnet relayer |
| Runtime and package manager | Node.js 24, npm |
| Repository and deployment target | GitHub, Vercel |

## Run locally

1. Install Node.js 24, matching `.nvmrc`.
2. Run `npm ci`.
3. Create `.env.local` from `.env.example` **only if it does not already exist**. In PowerShell:

   ```powershell
   if (-not (Test-Path .env.local)) {
     Copy-Item .env.example .env.local
   }
   ```

4. Configure an AI provider as shown below.
5. Run `npm run dev` and open http://localhost:3000.

If PowerShell blocks npm's script launcher, use `npm.cmd` in place of `npm`.

### Google Gemini

Set these values in `.env.local`:

```dotenv
AI_PROVIDER=google
GOOGLE_GENERATIVE_AI_API_KEY=your_actual_key
GOOGLE_GENERATIVE_AI_MODEL=gemini-3.6-flash
```

Gemini 3.6 Flash was verified with a real response during local setup. The checked-in environment template and code fallback still specify `gemini-2.5-flash`; explicitly override that value as above. During verification, Google rejected Gemini 2.5 Flash for the configured new-user account and directed it to Gemini 3.6 Flash.

Use a model available to your provider account. Save environment changes and restart the development server if they are not picked up.

### OpenAI

To select OpenAI instead:

```dotenv
AI_PROVIDER=openai
OPENAI_API_KEY=your_actual_key
OPENAI_MODEL=gpt-4.1-mini
```

Only the selected provider needs a key. The model name is configurable. API requests use your provider account and its usage quota.

Keep credentials in `.env.local` or your hosting environment. Both `.env.local` and the local `API key/` directory are ignored by Git. Never put provider keys or delegate private keys in variables prefixed with `NEXT_PUBLIC_`.

## Chat and session behavior

Press **Enter** or click send to submit a message. Use **Shift + Enter** for a new line. Replies stream into the conversation and render as Markdown.

History is stored in `sessionStorage` for the current tab and restored after refresh. **New conversation** clears the conversation and composer. This is browser session storage, not a database or cross-device memory service. If storage is unavailable, chat continues in page memory and displays a notice.

Each request sends the full conversation rather than silently removing earlier messages. Limits are:

| Limit | Value |
| --- | --- |
| Messages per request | 40, counting user and assistant messages |
| User message length | 8,000 characters |
| Assistant context entry length | 32,000 characters |
| Serialized request length | 64,000 characters |
| Generated output | 1,500 tokens |
| Provider timeout | 45 seconds |

At the conversation limit, start a new conversation. If a response is interrupted, text already received remains visible. Requests that fail before producing text restore the prompt for retry.

### API routes

- `GET /api/health` returns application liveness. It does not verify AI credentials or external services.
- `POST /api/chat` accepts `{ "messages": [{ "role": "user", "text": "Hello" }] }` and streams newline-delimited JSON events: `text`, `done`, or `error`. Validation and configuration failures return JSON error responses.

Guest chat bypasses Supabase session refresh and requires no wallet, Supabase, or Walrus credentials. Input and output limits are implemented; distributed rate limiting is not.

## Optional integration helpers

### Supabase

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to use the browser/server clients. They access PostgreSQL through Supabase's Data API, so a direct database password is unnecessary.

The proxy refreshes sessions but does not authorize application routes. Future protected handlers must verify users or claims. Add Row Level Security policies with application-table migrations, and configure Auth site and redirect URLs when adding sign-in.

### Walrus Memory

The server-only helper uses `@mysten-incubation/memwal`. Configure a Mainnet account object ID and its registered delegate key using the variables in `.env.example`. The helper expects a 32-byte Ed25519 private key encoded as 64 hexadecimal characters without a `0x` prefix.

`createMemoryClient()` takes a verified Supabase user UUID and derives a per-user namespace within the configured account. This is application-level isolation, not separate on-chain ownership. Keep the raw client and namespace overrides server-side.

`WALRUS_NETWORK` is restricted to `mainnet`, but the relayer controls the actual network: an environment value cannot change the relayer's deployment. Account provisioning, funding, and Mainnet transactions require separate setup. Guest chat does not write memories.

## Project structure

```text
src/
  app/
    api/chat/route.ts       Streaming AI endpoint
    api/health/route.ts     Liveness endpoint
    page.tsx               Chat interface and tab-session lifecycle
    globals.css            Layout, themes, and message formatting
  components/
    chat-message.tsx       Markdown renderer
    ui/                    Reusable shadcn/ui components
  lib/
    ai/
      configuration.ts     Provider configuration validation
      model.ts             Model selection
      chat-handler.ts      Request validation and stream handling
      session.ts           History validation and request serialization
    env/                   Public configuration validation
    memory/                Walrus Memory helper
    supabase/              Browser and server Supabase clients
  proxy.ts                 Supabase session refresh
tests/                     Chat and session regression tests
supabase/migrations/       Placeholder for application migrations
.github/workflows/ci.yml    Automated checks
```

## Validation

```sh
npm run lint
npm test
npm run typecheck
npm run build
npm start
```

Run `npm start` after a successful build. Tests cover guest access, full conversation context, session restoration, request limits, incremental streaming, and safe failure handling. Automated tests do not call paid AI providers.

CI runs installation, lint, tests, TypeScript checks, and a production build. Add shadcn components with `npx shadcn@latest add <component>`.

## Deploy on Vercel

1. Import [this GitHub repository](https://github.com/davelee001/zekirlee) into Vercel.
2. Select Next.js and Node.js 24.
3. Use `npm ci` for installation and `npm run build` for the build.
4. Configure the selected provider's API key and model in the appropriate Vercel environments. Local `.env.local` values are not pushed to GitHub.
5. Deploy, then verify an actual chat response as well as `/api/health`.

No custom `vercel.json` is required by this application. Configure Supabase Auth URLs separately if enabling authentication. Use separate service resources for preview and production as appropriate.

## Troubleshooting

| Symptom | Action |
| --- | --- |
| Chat setup error | Set the selected provider's key in `.env.local` or Vercel, then restart/redeploy. |
| Invalid API key | Replace the key with a valid key for the selected provider. |
| Model unavailable | Set a model supported by your account; the local Gemini setup was verified with `gemini-3.6-flash`. |
| Interrupted reply | Retry; check provider availability and quota if it persists. |
| Conversation full | Click **New conversation** to reset context. |
| History disappears on refresh | Check the storage notice and browser session-storage permissions. |
| npm blocked in PowerShell | Use `npm.cmd`. |

## References

- [Next.js documentation](https://nextjs.org/docs)
- [Vercel AI SDK documentation](https://ai-sdk.dev/docs)
- [shadcn/ui documentation](https://ui.shadcn.com/docs)
- [Supabase server-side auth](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Walrus Memory API](https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/api-reference.md)
