# Zekirlee

Application foundation using Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Vercel AI SDK, Supabase Auth/PostgreSQL, and Walrus Memory. Uses npm and Node.js 24 (see .nvmrc).

## Local development

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env.local` (PowerShell: `Copy-Item .env.example .env.local`).
3. Fill in the credentials for integrations you want to use.
4. Run `npm run dev` and open http://localhost:3000.

On Windows with restricted PowerShell execution policies, use `npm.cmd` instead of `npm`.
The starter page and /api/health work without external credentials. Integration configuration is validated when its client is created. Health reports application liveness, not external service readiness.

## Structure

- `src/app`: pages, root layout, global styles, and API routes.
- `src/components/ui`: editable shadcn/ui components.
- `src/hooks`: shared React hooks.
- `src/lib/ai/model.ts`: server-only Google/OpenAI model selection.
- `src/lib/memory/client.ts`: server-only Walrus Memory client scoped by verified user ID.
- `src/lib/supabase`: browser and server database/auth clients.
- `src/lib/env`: public configuration validation.
- `src/proxy.ts`: Supabase cookie/session refresh.
- `supabase/migrations`: versioned PostgreSQL migrations as features are added.
- `.github/workflows/ci.yml`: lint, typecheck, and production build.

## Environment and integrations

`.env.local` is ignored by Git. Never prefix provider credentials or delegate private keys with NEXT_PUBLIC_; that prefix exposes values to browsers.

**Supabase:** Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY from your project's Connect dialog. Configure the Auth site URL for localhost in development and your Vercel/custom domain in production. Add redirect URLs when implementing sign-in. Both clients use Supabase's Data API for PostgreSQL, so a direct database password is unnecessary. Enable Row Level Security and appropriate policies in every future application-table migration. The proxy refreshes sessions but does not authorize routes; protected handlers must verify claims or users themselves. Login screens and application tables are not part of this scaffold.

**AI:** AI_PROVIDER is google (default) or openai. Set the corresponding server-side API key; Gemini defaults to gemini-2.5-flash. OPENAI_MODEL defaults to gpt-4.1-mini. The chat UI calls POST /api/chat without requiring a wallet, login, Supabase, or Walrus credentials. Requests use the configured provider and incur its normal usage charges. Missing credentials or provider failures show a retryable error, never a simulated answer. The full conversation is sent as context (up to 40 messages and a 64,000-character request). At the limit, the app asks users to start a new conversation instead of silently discarding context. History is saved in sessionStorage for the current browser tab and restored on refresh; New conversation clears it. If browser storage is unavailable, chat continues in page memory with a notice. Wallet-specific data, live retrieval, and persistent memory are not used by guest chat. Requests have input/output limits and a 45-second provider timeout; this endpoint does not implement distributed rate limiting.

**Walrus Memory:** Uses the official `@mysten-incubation/memwal` SDK. Set a Mainnet account object ID and its registered 32-byte Ed25519 delegate private key (64 hexadecimal characters, no 0x prefix). WALRUS_NETWORK is restricted to mainnet. The relayer API does not accept a network setting: verify your selected relayer is deployed against Walrus/Sui Mainnet. The environment value alone cannot change the relayer's network. The default URL follows the SDK API documentation; availability and account access must be verified before use.

createMemoryClient() requires a UUID from a verified Supabase session and derives a per-user namespace. This is application-level isolation within one configured account, not separate on-chain ownership. Do not expose the raw client or allow callers to override namespaces. Provisioning/funding accounts and issuing Mainnet transactions are separate setup steps. No memories are written automatically.

## Checks

- `npm run lint`
- `npm test` (guest chat and error-handling regression tests; no provider calls)
- `npm run typecheck`
- `npm run build`
- `npm start` (after building)

Add shadcn components with `npx shadcn@latest add <component>`; components.json already maps the aliases and Tailwind stylesheet.

## GitHub and Vercel

Git is initialized with origin set to https://github.com/davelee001/zekirlee.git. Push the completed scaffold when ready, then import that repository into Vercel. Select Next.js, Node.js 24, install command `npm ci`, and build command `npm run build`. Next.js requires no custom vercel.json.

Set the variables from .env.example in Vercel's appropriate environments. Set NEXT_PUBLIC_APP_URL to your deployed URL and configure matching Supabase Auth URLs. Public variables require a rebuild after changes. Use separate Supabase projects and Walrus accounts/namespaces for preview and production. The starter has not been deployed and no cloud resources have been provisioned.

## References

- [Next.js setup](https://nextjs.org/docs/app/getting-started/installation)
- [shadcn manual setup](https://ui.shadcn.com/docs/installation/manual)
- [Vercel AI SDK](https://ai-sdk.dev/docs/getting-started/choosing-a-provider)
- [Supabase server-side auth](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Walrus Memory API](https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/api-reference.md)
