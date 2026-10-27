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

Backend reliability, Walrus mainnet configuration, and opt-in memory storage and recall are implemented. Oversized chat requests are rejected while reading the body, and cancelling a response aborts provider generation. Separate live-check commands are available for guest chat and Walrus account access; the latter still needs configured mainnet credentials.

| Backend capability | Status |
| --- | --- |
| Guest AI chat and session context | Implemented and verified with live requests |
| Walrus mainnet configuration | Implemented; hosted relayer confirmed to report `mainnet` |
| Walrus account access | Requires a mainnet account ID and registered delegate key; authenticated access is not yet verified |
| Memory storage | Opt-in extraction and storage implemented; a live mainnet write still requires configured credentials |
| Memory recall in replies | Opt-in retrieval implemented with bounded context and fallback to ordinary chat; live account access remains unverified |
| Memory management | Settings shows the active account or guest scope, counts, and confirmed clearing; live clearing remains unverified |
| Account-linked memory | Shared storage, recall, and namespace rotation implemented; memory-space migration and live two-device verification pending |
| Supabase authentication and database | Email-link sign-in, sign-out, private snapshot APIs, and migration implemented; credentials, migration execution, and live verification remain pending |

Optional wallet connection is implemented; live blockchain retrieval in chat remains outside the delivered scope. Chat continues to work without Supabase or Walrus credentials.

The latest backend increment adds account-linked Walrus memory: signed-in users share saved facts across devices, while guests retain browser-scoped memory. Clearing rotates the active memory space so late writes cannot appear in subsequent recalls. Account changes pause memory in open tabs until the user enables it again.

The latest validation passed 56 application tests, TypeScript checks, scoped lint, and a production build. Real Supabase sign-in, database isolation, and Walrus storage still need configured-service verification. Track implementation and setup separately in the [remaining-work checklist](docs/remaining-work.md).

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
- Optional extraction and storage of useful user details in Walrus, with confirmed-save and failure notices.
- Relevant saved facts supplied to future replies, with bounded retrieval time and fallback to ordinary chat.
- Signed browser identities for guest memory, without requiring a wallet or sign-in.
- Account-linked memory across devices, with server-verified ownership and shared clearing after database setup.
- Settings controls to check memory status and clear the active account or guest space separately from chat history.
- Optional email-link account sign-in, with explicit conversation snapshot saving and a paginated saved-chat library.

Wallet connection is available from chat and Wallet activity. Live blockchain retrieval and automatic wallet context in replies are not implemented. Account sign-in is available in Settings once Supabase is configured. Signed-in Walrus memory follows the account across devices; guest memory remains browser-scoped and is not migrated on sign-in.

## Workspace pages

| Destination | Route | Content and actions |
| --- | --- | --- |
| Overview | `/overview` | Workspace introduction and shortcuts to chat, learning, and settings. |
| Conversations | `/conversations` or `/` | Streamed AI chat with the current tab's conversation history. |
| Saved chats | `/history` | Sign in to browse, open, and delete private account snapshots. |
| Knowledge | `/knowledge` | Searchable topics, category filters, a pinned-only view, and links to official resources. |
| Sui basics | `/sui-basics` | Introductory explanations of objects, ownership, Move, and transactions. |
| Wallet activity | `/wallet-activity` | Connect a Sui wallet or enter a public address, then open its Mainnet activity on Suiscan. |
| Settings | `/settings` | Email sign-in, sign-out, themes, tab-history clearing, and saved-memory management. |
| Help center | `/help` | Messaging instructions, session behavior, and troubleshooting guidance. |
| Sui network | `/network` | Links to a Mainnet explorer and public-address lookup. |

The shared sidebar highlights the active destination and supports a collapsible mobile menu. Use Knowledge to pin or unpin topics; the sidebar updates immediately and remembers your choices in this browser. Sui basics and Wallet activity are pinned initially. The plus icon opens Knowledge to browse topics. Navigating back to Conversations restores saved history from the current tab.

Knowledge resources are curated links, not documents automatically searched by the chatbot. Manual wallet lookup opens an external explorer without connecting a wallet. Optional connection also exposes the selected public address and explorer link without signing transactions. The network page does not monitor live network health.

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

### Save and reopen conversations

Once Supabase is configured using the setup below:

1. Open **Settings > Account** and sign in using the emailed link.
2. Return to chat, send messages, and wait for the response to finish.
3. Select **Save to account** and wait for the saved confirmation.
4. Open **Saved chats** in the sidebar to browse your snapshots. The library shows 20 snapshots per page.
5. Select **Open** and confirm to replace this tab's current conversation with the snapshot. Save any current messages you want to keep first.

Continuing an opened conversation changes the tab's history. Select **Save to account** again to create a new snapshot; existing snapshots are not updated automatically. If saving times out, check Saved chats before retrying because the server may already have saved it.

**Delete** requires confirmation and removes only the selected account snapshot. It does not clear the current conversation or Walrus memories. Signing out clears local chat history and notifies open chat tabs; saved account snapshots remain available when you sign back in.

### Where information is stored

| Storage | What it keeps | Scope and controls |
| --- | --- | --- |
| Tab session | Current conversation messages | Restored on refresh in that tab; cleared by New conversation or session-history clearing. |
| Supabase | Explicitly saved conversation snapshots | Available to the signed-in owner; browse, open, or delete through Saved chats. Requires database setup. |
| Walrus | Useful facts extracted with memory enabled | Linked to the signed-in account, or a browser cookie for guests; manage its searchable index in Settings. Requires mainnet credentials. |

Signing in does not upload existing chat or migrate guest Walrus facts. With the memory-space migration applied, new signed-in memory uses a shared account namespace across devices.

### API routes

- `GET /api/health` returns application liveness. It does not verify AI credentials or external services.
- `POST /api/chat` accepts `{ "messages": [{ "role": "user", "text": "Hello" }] }` and streams newline-delimited JSON events: `text`, `done`, or `error`. Validation and configuration failures return JSON error responses.
- Add `"useMemory": true` to opt into recall for a chat request. Recall requires a same-origin request and either a verified account or a signed guest memory cookie. Response headers `X-Zekirlee-Memory` and `X-Zekirlee-Memory-Count` report retrieval status and the number of supplied facts, without exposing saved content in headers.
- `POST /api/memory` accepts `{ "consent": true, "text": "I prefer TypeScript." }` from the same origin. It establishes a signed guest cookie before writing (HTTP 409 with `MEMORY_SESSION_CREATED`, retried once by the UI), extracts facts, and returns confirmed `saved` and unconfirmed `failed` counts. Missing configuration returns HTTP 503 without affecting chat.
- `GET /api/memory/manage` reports `unconfigured`, `new`, `ready`, or `unavailable`; for an existing signed browser identity, it verifies mainnet and fetches that namespace's searchable-memory count.
- `DELETE /api/memory/manage` requires a same-origin request and `X-Zekirlee-Confirm: forget-memory`. It clears only the server-resolved account or guest namespace, never a client-supplied namespace. Successful clearing rotates the account generation or replaces the guest cookie.
- `GET /api/conversations?page=0` lists 20 private snapshot summaries with a `hasMore` flag. `POST /api/conversations` saves `{ "messages": [...] }` for the verified signed-in user.
- `GET /api/conversations/:id` loads an owned snapshot. `DELETE` requires a same-origin request and `X-Zekirlee-Confirm: delete-conversation`. Other users' snapshots return 404.

Guest chat bypasses Supabase session refresh and requires no wallet, Supabase, or Walrus credentials. Input and output limits are implemented; distributed rate limiting is not.

## Optional integration helpers

### Sui wallet connection

Use **Connect Wallet** in the chat header, context panel, or Wallet activity page. Choose a compatible wallet and approve its connection request. The wallet menu supports account selection and disconnect; Wallet activity shows the full public address, a copy button, and a Suiscan Mainnet link. Manual public-address lookup remains available without connecting.

Connection uses [Mysten's dApp Kit for Next.js](https://sdk.mystenlabs.com/dapp-kit/getting-started/next-js), loaded only in the browser. The shared connection follows in-app navigation. Automatic reconnection and persisted wallet selection are disabled, so reloading requires an explicit connection. Wallets must advertise Sui Mainnet support.

Connecting does not request a signature or transaction, authenticate a Supabase account, or migrate memory. The connected address is not automatically included in AI requests or Walrus memory. Live balances, transactions, and wallet-aware replies remain pending. Real extension approval still needs manual verification; automated tests use a mock Wallet Standard provider.

To check manually, connect from the chat header, verify the same account on Wallet activity, switch accounts, copy the address, and disconnect. Also cancel a connection request and confirm guest chat stays usable. Reload to verify the connection is not restored automatically.

### Supabase

1. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local` and the deployment environment. Restart locally or rebuild the deployment when changing public values. No service-role key is used by the app.
2. Apply `supabase/migrations/202610230001_conversations.sql` through the Supabase SQL editor or your migration tooling. It creates the conversations table, validates message structure, and restricts reads, inserts, and deletes to the owning authenticated user. Saved snapshots cannot be updated in place.
3. In Supabase Auth, configure the Site URL and allow `http://localhost:3000/auth/callback` for development plus your deployed `/auth/callback` URL. Configure email delivery for your intended users.
4. For the server-side email flow, set the Magic Link email template to a link such as:

   ```html
   <a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&amp;type=email">Sign in to ZekirLee</a>
   ```

   The app passes `/auth/callback` as `emailRedirectTo`. The callback verifies email token hashes and also supports PKCE code exchanges; code-based links must be opened in the browser that requested them. See [Supabase passwordless email sign-in](https://supabase.com/docs/guides/auth/auth-email-passwordless).
5. Open **Settings → Account**, enter an email, and request a sign-in link. New users can create an account through the same flow. Invalid or expired links return to account settings with a retry message.
6. In a configured **test project**, run `supabase/tests/conversations.sql` to exercise owner isolation, anonymous denial, and immutable snapshots. The script creates temporary test users inside a transaction and rolls back its changes. It has not been executed in this workspace because a database connection is not configured.

### Saved conversations

After signing in, use **Save to account** in chat to save an immutable snapshot. Nothing is uploaded to the conversation database automatically. Each save creates a separate snapshot titled from its first user message. API limits match chat's 40 messages and 64,000 serialized characters; the database also validates roles and message lengths independently.

Open **Saved chats** to browse snapshots, load one into the current tab, or delete it. Opening and deleting require confirmation. Opening replaces local tab history; continuing a loaded conversation does not change the old snapshot. Saving again creates another one. Pagination lists 20 records at a time, with newest snapshots first.

Protected API handlers verify the user with Supabase Auth and bind queries to that user's ID. PostgreSQL row-level security independently enforces ownership. The proxy refreshes sessions but is not the authorization boundary. Sign-out removes local tab history and notifies open chat tabs; it does not delete account snapshots or browser-linked Walrus memory.

Deleting a snapshot leaves the active tab conversation and Walrus memory unchanged. Account history works across devices after sign-in. Account memory also follows sign-in once the separate memory-space migration below is applied. The client uses cookie-backed Supabase sessions, while guest chat remains available if account services are unavailable.

### Account-linked memory setup

Apply `supabase/migrations/202610270001_memory_spaces.sql` after configuring Supabase. It stores one namespace generation per user and restricts access using row-level security. Run `supabase/tests/memory_spaces.sql` in a test project to check ownership enforcement. This migration and SQL test have not been run against a live project in this workspace.

| Setup step | Required for |
| --- | --- |
| Configure the Supabase URL, publishable key, and email callback | Verified account sign-in |
| Apply `202610230001_conversations.sql` | Private saved-conversation snapshots |
| Apply `202610270001_memory_spaces.sql` | Shared account memory and clearing across devices |
| Configure the Walrus mainnet account and delegate | Storage, recall, memory counts, and index clearing |
| Run both SQL files in `supabase/tests/` in a test project | Database ownership checks, separately from `npm test` |

AI-only guest chat requires none of these optional setup steps. Signed-in memory requires both Supabase and Walrus configuration.

Storage, recall, and management verify the signed-in user on the server and resolve the same account namespace on every device. Guests retain their signed-cookie namespace. Authentication or database errors disable the memory operation instead of falling back to another identity; ordinary chat continues. No guest facts are copied on sign-in.

Clearing account memory first clears its current search index, then rotates its namespace generation in PostgreSQL. Subsequent requests on all devices use the new generation; already submitted writes remain in the old space. Concurrent clears use a conditional update so one cannot replace a newer generation. Failed or timed-out clearing must be checked with **Refresh status** before retrying. Replies already in progress may still contain previously recalled facts, and other devices can continue saving new facts.

For live verification, sign in to the same account on two browsers, opt into memory, save a harmless preference on one, and recall it from a new conversation on the other. Verify that a different account cannot recall it. Clear from one device and verify subsequent recall on the other. These checks require configured Supabase and Walrus credentials and make real provider requests.

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

`await createMemoryClient(verifiedUserId)` re-verifies the current Supabase user, checks that the supplied UUID matches, and uses the current account namespace generation after validating the relayer network. This is application-level isolation, not separate on-chain ownership. Keep the raw client and namespace overrides server-side. Callers must obtain the user ID from verified authentication, never from request input.

`WALRUS_NETWORK` is restricted to `mainnet`, but the relayer controls the actual network: an environment value cannot change its deployment. A missing network or a non-mainnet response fails closed. Account provisioning, funding, and Mainnet transactions require separate setup. Guest chat continues to work without memory credentials.

### Memory storage

Enable **Use and save memory with Walrus** above the conversation to recall relevant saved details and save details from subsequent successful chat turns. The control starts off on each page load. Each completed reply triggers a separate memory request using only the latest user message, so storage does not delay streamed answers or resubmit the whole conversation.

The configured AI model extracts at most three short facts about preferences, ongoing projects, goals, or learning needs. Each fact must have a supporting quote in the message. Empty extraction results cause no writes; repeated facts within an extraction are collapsed. Obvious credential-bearing messages are skipped, and extraction instructions exclude sensitive personal information. These filters are not a guarantee of detecting every sensitive detail.

The server waits for Walrus storage confirmation before reporting a fact as saved. Stable per-fact, per-namespace idempotency keys help retries reuse storage jobs; differently worded facts can still produce separate memories. Partial failures report both confirmed and unconfirmed counts. A timed-out job may still complete on the relayer.

Guest memories use a separate namespace tied to a signed, HttpOnly browser cookie, with Secure enabled over HTTPS and SameSite Strict. The cookie is established before any writes. No wallet or Supabase login is required. Clearing cookies, changing browsers, or rotating the delegate signing key changes the guest identity; existing memories are not automatically migrated or deleted. The account delegate can access all its namespaces, so this is application-level isolation rather than separate on-chain ownership.

Turning memory off stops future recall and saves and skips queued work; already submitted jobs may finish. Clearing chat history does not delete stored facts. Use **Settings → Saved memory** to clear the active account or guest searchable memory separately. Extraction uses the configured AI provider and storage uses the configured Walrus account, with their respective usage costs.

### Memory recall

With memory enabled, the latest message becomes a semantic search query in the verified account namespace, or the browser's guest namespace when signed out. Recall retrieves at most five facts, filters weak matches and duplicates, and caps supplied context at 2,000 characters. Saved facts are sent to the configured AI provider as untrusted contextual data; instructions tell the model to prioritize current user statements over old facts and ignore commands embedded in memories.

The app waits at most four seconds for recall before continuing with the current conversation. Missing configuration, an unavailable relayer, and failed retrieval never block ordinary chat. The UI distinguishes supplied facts, no matches, a new browser identity, and unavailable memory. A provider request already in progress may continue after the wait expires, but late results are not added to the reply.

Start a new conversation and re-enable memory after a page reload to use saved facts without the old message history. Recently submitted storage jobs may not yet be available for recall. Tests exercise a storage-to-recall round trip with the SDK's offline mock; a real mainnet round trip still needs valid account credentials.

### Try memory from a new conversation

1. Configure the AI provider and Walrus mainnet account variables in `.env.local`, then run `npm run test:memory` to verify signed account access.
2. Start the app with `npm run dev` and enable **Use and save memory with Walrus**.
3. Send a useful preference, such as **I prefer TypeScript for my projects.** Wait for the storage notice to confirm a saved detail.
4. Click **New conversation** in the same browser and ask **Which programming language do I prefer for projects?** Keep memory enabled; if you reload the page, enable it again.
5. Check the recall notice as well as the answer. It reports how many saved details were supplied, or explains that no matches were found or memory was unavailable.

This manual check performs real AI requests and may write to Walrus mainnet. A successful `test:memory` checks access without writing and does not replace this storage-and-recall check.

### What resets memory?

| Action | Effect |
| --- | --- |
| New conversation | Clears current chat context; stored Walrus facts remain available with memory enabled. |
| Reload page | Restores tab history, but resets the memory opt-in to off. |
| Turn memory off | Stops future recall and saves; previously stored facts remain. |
| Clear browser cookies | Loses the guest identity linking this browser to its stored facts; it does not delete them. |
| Switch device or browser | Guests use a different identity; signing in to the same account shares account memory after setup. |

### Manage saved memory

Open **Settings → Saved memory**, or use **Manage saved memory** above the chat. The status distinguishes missing configuration, a browser with no previous identity, an authenticated count of searchable memories, and a service failure. **Refresh status** retries the check without changing memory.

**Clear saved memory** opens a confirmation explaining the active scope. For guests, confirming removes this browser namespace's search-index entries and switches the browser to a fresh signed identity. For signed-in users, it clears and rotates the account space across devices without changing the guest cookie. This prevents jobs that finish in the old namespace from surfacing in future recalls. Chat history stays intact, so old details can still appear in the current conversation until you start a new one.

This is index clearing, not permanent blob erasure: encrypted Walrus blobs persist until expiry and the account operator can restore their index. The relayer's [forget handler](https://github.com/MystenLabs/MemWal/blob/dev/services/server/src/routes/admin.rs) documents these semantics. Settings cannot clear other users' namespaces or the entire operator-owned Walrus account.

Clearing pauses memory in open chat tabs using browser events and local storage notifications. When browser storage is blocked, other tabs may not receive the notification; turn memory off in those tabs too. Queued saves are invalidated on opt-out and navigation; already submitted jobs may still finish. Completed saves do not overwrite a replacement identity cookie.

The installed SDK has no public production `stats` or `forget` method. The server uses the documented relayer endpoints with account-bound Ed25519 signatures, mainnet and compatibility checks, and request deadlines. It never sends the delegate private key. Tests verify signatures, namespace binding, confirmation, and failure behavior with mocked transport; no automated test clears live mainnet data.

Remaining work includes connecting the Supabase project and running its migration/tests, migrating existing guest memory to accounts, and verifying real mainnet storage, recall, and clearing. See the [remaining-work checklist](docs/remaining-work.md) for the full list.

## Project structure

```text
src/
  app/
    api/chat/route.ts       Streaming AI endpoint
    api/health/route.ts     Liveness endpoint
    api/memory/route.ts     Opt-in extraction and confirmed storage endpoint
    api/memory/manage/route.ts Account/guest memory status and clearing
    api/conversations/     Authenticated snapshot list/save/open/delete endpoints
    auth/callback/route.ts Email token and PKCE session exchange
    history/page.tsx       Saved-conversation library
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
    memory-settings.tsx    Memory status, counts, and confirmed index clearing
    account-settings.tsx   Email sign-in and sign-out
    conversation-library.tsx Private snapshot browsing and confirmation controls
    save-conversation.tsx  Explicit account-saving control
    wallet-lookup.tsx      Public-address validation and explorer link
    wallet-controls.tsx    Browser-only wallet loading boundary
    wallet-ui.tsx          Wallet selection, account display, copy, and disconnect
    ui/                    Reusable shadcn/ui components
  lib/
    ai/
      configuration.ts     Provider configuration validation
      model.ts             Model selection
      chat-handler.ts      Request validation and stream handling
      session.ts           History validation and request serialization
    env/                   Public configuration validation
    memory/
      account.ts           Verified account lookup and conditional namespace rotation
      scope.ts             Shared account or signed guest namespace selection
      configuration.ts     Credential validation, user namespaces, mainnet verification
      client.ts            Server-only Walrus client factory
      identity.ts          Signed browser identity for guest memory
      storage.ts           Fact validation, deduplication, and storage confirmation
      recall.ts            Bounded retrieval and model context formatting
      management.ts        Status and clear handler authorization
      relayer-admin.ts     Signed relayer stats and forget requests
      browser-events.ts    Memory pause notifications between tabs
    supabase/              Browser and server Supabase clients
    conversations/         Validated API handlers and owner-bound database adapter
    auth/                  Email-link verification helper
    wallet/dapp-kit.ts      Shared Mainnet wallet configuration
  proxy.ts                 Supabase session refresh
scripts/
  check-backend.mjs         Live health, guest chat, and follow-up context check
  check-memory.mjs          Mainnet and authenticated recall check without writes
tests/                     Chat, session, knowledge, and memory regression tests
supabase/migrations/       Conversation schema, constraints, and ownership policies
supabase/tests/            Transactional database isolation checks (run separately)
docs/remaining-work.md     Outstanding implementation and live-setup checklist
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

The regression suite currently contains 56 tests, including chat/session behavior, memory storage/recall/management, authenticated conversation operations, ownership-input rejection, and email-link validation. Database policies and real email delivery require the separate configured-project checks; mocked API tests do not verify PostgreSQL enforcement.

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
| Chat does not recall Walrus memories | Enable **Use and save memory with Walrus**, use the same signed-in account (or the original guest browser), and check the recall notice. Verify credentials with `npm run test:memory`; recent writes may still be processing. |
| Memory clearing could not be confirmed | Refresh memory status before retrying. A timeout may occur after the relayer applied the clear; the browser identity stays unchanged on failure. |
| Account sign-in is not configured | Set both public Supabase values and restart/rebuild. Guest chat remains available. |
| Email link fails | Check allowed callback URLs and the Magic Link email template; request a fresh link. |
| Signed in but snapshots fail | Apply the conversation migration, then check the database policies and run the isolation test in a test project. |
| Guest memory works but signed-in memory fails | Apply the memory-space migration and verify Supabase authentication and table policies. Account errors do not fall back to guest memory. |
| Memory turns off after switching accounts | Re-enable memory for the current identity. Existing guest facts are not migrated into the account. |
| npm blocked in PowerShell | Use `npm.cmd`. |

## References

- [Next.js documentation](https://nextjs.org/docs)
- [Vercel AI SDK documentation](https://ai-sdk.dev/docs)
- [shadcn/ui documentation](https://ui.shadcn.com/docs)
- [Supabase server-side auth](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Walrus Memory API](https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/api-reference.md)
