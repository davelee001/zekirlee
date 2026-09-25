# Zekirlee

Zekirlee is a conversational AI workspace focused on Sui. Users can ask questions, receive streamed answers, and continue a conversation without connecting a wallet or signing in.

## Project status

**Phase one is complete.** The application foundation and interactive guest workspace have been implemented and pushed to `main`.

Delivered in this phase:

- Application structure, npm dependencies, environment configuration, and GitHub CI.
- AI chat with streamed Markdown responses and full conversation context within session limits.
- Tab-session history, refresh recovery, and a new-conversation reset.
- A visible composer, contrasting message bubbles, and persistent light/dark preferences.
- Dedicated Overview, Conversations, Knowledge, Sui basics, Wallet activity, Settings, Help, and Network pages.
- Knowledge search, category filters, pinned-only filtering, and browser-saved sidebar pins.
- Public-address explorer links, theme controls, and confirmed session-history clearing.

Backend reliability and Walrus mainnet configuration are now implemented. Oversized chat requests are rejected while reading the body, and cancelling a response aborts provider generation. Separate live checks verify guest chat with follow-up context and Walrus account access.

| Backend capability | Status |
| --- | --- |
| Guest AI chat and session context | Implemented and verified with live requests |
| Walrus mainnet configuration | Implemented; hosted relayer confirmed to report `mainnet` |
| Walrus account access | Requires a mainnet account ID and registered delegate key; authenticated access is not yet verified |
| Memory storage | Opt-in extraction and storage implemented; a live mainnet write still requires configured credentials |
| Memory recall in replies | Not yet implemented |
| Supabase authentication and database | Client helpers prepared; sign-in and database-backed conversations remain pending |

Wallet connection and live blockchain retrieval remain outside the delivered scope. Chat continues to work without Supabase or Walrus credentials.

## Current features

- Real AI responses through the Vercel AI SDK, with Google Gemini and OpenAI provider options.
- Progressive replies that preserve the reader's scroll position.
- Markdown formatting for headings, bold, italics, lists, links, quotes, code, and tables.
- A connected conversation panel with replies above the input and an inline send button.
- Light assistant bubbles and darker user bubbles.
- Light and dark themes with a sun/moon toggle and a saved browser preference.
- Conversation history retained across refreshes in the current browser tab.
- Full session context sent with follow-up questions, within explicit request limits.
- A **New conversation** button that clears the current history.
- Loading, configuration, storage, and interrupted-response feedback.
- Sidebar navigation to dedicated workspace, learning, settings, and help pages.
- Interactive Knowledge search, category filters, and a pinned-only view.
- Pin/unpin controls that update the sidebar immediately and remember choices in this browser.
- Public Sui address lookup that opens wallet activity in an external explorer.
- A compact introduction and visible message input, with conversation history scrolling independently.

Wallet connection, live blockchain retrieval, login screens, and memory recall are not implemented in the chat flow. Users can opt in to saving useful details from new messages to Walrus without a wallet or sign-in, once server credentials are configured.

## Workspace pages

| Destination | Route | Content and actions |
| --- | --- | --- |
| Overview | `/overview` | Workspace introduction and shortcuts to chat, learning, and settings. |
| Conversations | `/conversations` or `/` | Streamed AI chat with the current tab's conversation history. |
| Knowledge | `/knowledge` | Searchable topics, category filters, a pinned-only view, and links to official resources. |
| Sui basics | `/sui-basics` | Introductory explanations of objects, ownership, Move, and transactions. |
| Wallet activity | `/wallet-activity` | Validate a public Sui address and open its Mainnet activity on Suiscan. |
| Settings | `/settings` | Switch themes or clear this tab's saved conversation after confirmation. |
| Help center | `/help` | Messaging instructions, session behavior, and troubleshooting guidance. |
| Sui network | `/network` | Links to a Mainnet explorer and public-address lookup. |

The shared sidebar highlights the active destination and supports a collapsible mobile menu. Use Knowledge to pin or unpin topics; the sidebar updates immediately and remembers your choices in this browser. Sui basics and Wallet activity are pinned initially. The plus icon opens Knowledge to browse topics. Navigating back to Conversations restores saved history from the current tab.

Knowledge resources are curated links, not documents automatically searched by the chatbot. Wallet lookup opens an external explorer without connecting a wallet or signing transactions. The network page does not monitor live network health.

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

### Appearance

Use the sun/moon button in the top bar to switch between light and dark themes. On the first visit, the app follows your system's color preference. Your selection is saved in `localStorage` and applied on subsequent visits before the page paints. If browser storage is unavailable, the toggle still works for the current page.

Both themes style the workspace, chat bubbles, input, and Markdown responses. Assistant messages use a lighter background than user messages in each theme.

### Conversations

Press **Enter** or click send to submit a message. Use **Shift + Enter** for a new line. Replies stream into the conversation and render as Markdown.

The introduction stays visible in a smaller font, while the message input fits within the initial screen. Conversation history scrolls above the input, so long replies do not push the composer down the page. The input receives focus after session restoration and uses a contrasting native blinking cursor without automatically scrolling the page.

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
- `POST /api/memory` accepts `{ "consent": true, "text": "I prefer TypeScript." }` from the same origin. It establishes a signed guest cookie before writing (HTTP 409 with `MEMORY_SESSION_CREATED`, retried once by the UI), extracts facts, and returns confirmed `saved` and unconfirmed `failed` counts. Missing configuration returns HTTP 503 without affecting chat.

Guest chat bypasses Supabase session refresh and requires no wallet, Supabase, or Walrus credentials. Input and output limits are implemented; distributed rate limiting is not.

## Optional integration helpers

### Supabase

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to use the browser/server clients. They access PostgreSQL through Supabase's Data API, so a direct database password is unnecessary.

The proxy refreshes sessions but does not authorize application routes. Future protected handlers must verify users or claims. Add Row Level Security policies with application-table migrations, and configure Auth site and redirect URLs when adding sign-in.

### Walrus Memory

The server-only helper uses `@mysten-incubation/memwal`. Set these values in `.env.local` and in the Vercel server environment:

```dotenv
WALRUS_NETWORK=mainnet
WALRUS_MEMORY_SERVER_URL=https://relayer.memory.walrus.xyz
WALRUS_MEMORY_ACCOUNT_ID=your_mainnet_account_object_id
WALRUS_MEMORY_DELEGATE_KEY=your_registered_delegate_private_key
WALRUS_MEMORY_NAMESPACE=zekirlee
```

The account ID is a **MemWalAccount object ID**, not your wallet address. Use a mainnet account and register an Ed25519 delegate through the [Walrus Memory account setup](https://memory.walrus.xyz). The delegate key must be 64 hex characters, with an optional `0x` prefix. Keep it server-side and out of Git. The namespace accepts 1–64 letters, numbers, underscores, or hyphens.

Run `npm run test:memory` after setting the credentials. It checks configuration, verifies that the relayer's `/config` reports `mainnet`, and makes an authenticated recall in a dedicated connection-check namespace. It does not write memories or print credentials or recalled content. A passing public health request alone does not validate delegate access.

`await createMemoryClient(verifiedUserId)` takes a verified Supabase user UUID, validates the relayer network before returning a client, and derives a per-user namespace within the configured account. This is application-level isolation, not separate on-chain ownership. Keep the raw client and namespace overrides server-side. Callers must obtain the user ID from verified authentication, never from request input.

`WALRUS_NETWORK` is restricted to `mainnet`, but the relayer controls the actual network: an environment value cannot change its deployment. A missing network or a non-mainnet response fails closed. Account provisioning, funding, and Mainnet transactions require separate setup. Guest chat continues to work without memory credentials.

### Memory storage

Enable **Save useful details to Walrus** above the conversation to save details from subsequent successful chat turns. The control starts off on each page load. Each completed reply triggers a separate memory request using only the latest user message, so storage does not delay streamed answers or resubmit the whole conversation.

The configured AI model extracts at most three short facts about preferences, ongoing projects, goals, or learning needs. Each fact must have a supporting quote in the message. Empty extraction results cause no writes; repeated facts within an extraction are collapsed. Obvious credential-bearing messages are skipped, and extraction instructions exclude sensitive personal information. These filters are not a guarantee of detecting every sensitive detail.

The server waits for Walrus storage confirmation before reporting a fact as saved. Stable per-fact, per-namespace idempotency keys help retries reuse storage jobs; differently worded facts can still produce separate memories. Partial failures report both confirmed and unconfirmed counts. A timed-out job may still complete on the relayer.

`WALRUS_NETWORK` is restricted to `mainnet`, but the relayer controls the actual network: an environment value cannot change its deployment. A missing network or a non-mainnet response fails closed. Account provisioning, funding, and Mainnet transactions require separate setup. The chat route is not yet wired to store or recall memories; guest chat continues to work without memory credentials.

## Project structure

```text
src/
  app/
    api/chat/route.ts       Streaming AI endpoint
    api/health/route.ts     Liveness endpoint
    [section]/page.tsx      Overview, knowledge, guides, settings, help, and network pages
    conversations/page.tsx Dedicated route for the chat interface
    page.tsx               Chat interface and tab-session lifecycle
    globals.css            Layout, themes, and message formatting
  components/
    chat-message.tsx        Markdown renderer
    theme-toggle.tsx        Browser-persisted theme control
    workspace-sidebar.tsx  Shared navigation and mobile menu
    workspace-page.tsx     Shared layout for content pages
    workspace-settings.tsx Appearance and session-history controls
    wallet-lookup.tsx      Public-address validation and explorer link
    ui/                    Reusable shadcn/ui components
  lib/
    ai/
      configuration.ts     Provider configuration validation
      model.ts             Model selection
      chat-handler.ts      Request validation and stream handling
      session.ts           History validation and request serialization
    env/                   Public configuration validation
    memory/
      configuration.ts     Credential validation, user namespaces, mainnet verification
      client.ts            Server-only Walrus client factory
    supabase/              Browser and server Supabase clients
  proxy.ts                 Supabase session refresh
scripts/
  check-backend.mjs         Live health, guest chat, and follow-up context check
  check-memory.mjs          Mainnet and authenticated recall check without writes
tests/                     Chat, session, knowledge, and memory regression tests
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

The regression suite currently contains 21 tests, including request-body cancellation, provider cancellation, memory configuration validation, namespace separation, and rejection of non-mainnet relayers.

| Live check | Prerequisites | What it verifies |
| --- | --- | --- |
| `npm run test:backend` | Running app and configured AI provider | Health endpoint, streamed guest response, and follow-up context |
| `npm run test:memory` | Mainnet account ID, registered delegate key, reachable relayer | Mainnet deployment and signed recall access; no memory writes |

With the app running, run `npm run test:backend` to check health, a real guest AI response, and follow-up context. This separate smoke check makes two provider requests and uses your configured provider quota. It defaults to `http://localhost:3000`; set `BACKEND_URL` to check another server. Chat rejects oversized bodies while reading them and aborts provider generation when the response stream is cancelled.

Knowledge tests also cover combined search/category/pin filters and restoration of empty, invalid, or duplicate pin selections. If browser storage cannot save pin changes, selections remain available in page memory and the interface displays a notice.

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
| Memory configuration error | Set the mainnet MemWalAccount object ID and registered delegate key, then run `npm run test:memory`. |
| Relayer does not report mainnet | Check `WALRUS_MEMORY_SERVER_URL`; setting `WALRUS_NETWORK` cannot change the relayer deployment. |
| Memory connection check fails | Check connectivity, SDK compatibility, and whether the delegate is registered on the configured mainnet account. |
| Chat does not recall Walrus memories | The chat route is not yet connected to persistent memory; current history is stored in the browser tab. |
| npm blocked in PowerShell | Use `npm.cmd`. |

## References

- [Next.js documentation](https://nextjs.org/docs)
- [Vercel AI SDK documentation](https://ai-sdk.dev/docs)
- [shadcn/ui documentation](https://ui.shadcn.com/docs)
- [Supabase server-side auth](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Walrus Memory API](https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/api-reference.md)
