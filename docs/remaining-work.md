# Remaining work

Updated 23 October 2026. Implementation and live verification are tracked separately.

## Implemented, awaiting external setup or verification

| Item | Still required |
| --- | --- |
| Supabase email sign-in | Configure the project URL/publishable key, allowed callback URLs, email template, and delivery. Verify a real sign-in and sign-out. |
| Private saved conversations | Apply `supabase/migrations/202610230001_conversations.sql`; run `supabase/tests/conversations.sql` in a test project; verify saving, loading, deletion, and two-account isolation against PostgreSQL. |
| Walrus memory | Provide the mainnet account object ID and registered delegate key. Run `npm run test:memory`, then verify a real store/recall/clear cycle. |
| Deployment | Configure production environment values and Auth URLs, apply the migration, and verify the flows on the deployed Vercel URL. Production deployment has not been verified in this workspace. |

## Not implemented yet

1. **Account-linked Walrus memory across devices.** Memory still follows a signed browser cookie. Sign-in does not migrate guest memory or associate it with a Supabase account.
2. **Functional wallet connection and wallet context.** The current wallet controls are placeholders; public-address lookup only opens an explorer.
3. **Live blockchain tools in chat.** The model cannot fetch balances, transactions, network health, or current prices.
4. **Document retrieval for Knowledge.** Knowledge is a curated, searchable link collection; chat does not retrieve or ingest those documents.
5. **Individual memory review/editing/removal.** Settings clears an entire browser namespace's search index. There is no per-fact editor or permanent encrypted-blob erasure.
6. **Production abuse and cost controls.** Distributed rate limits, per-user quotas, and operational monitoring are not in place.

Saved conversations currently use explicit immutable snapshots. Automatic synchronization, editable snapshot titles, full-text history search, and account-deletion/export controls are not included in the current implementation.

## Current validation

- 48 offline application tests cover validation, consent, guest behavior, memory, conversation handlers, and email callback logic.
- TypeScript, scoped lint, and production builds validate application integration.
- Database tests are supplied but have not run against a live PostgreSQL/Supabase project.
- Mainnet writes/deletion and real authentication/email delivery remain unverified because credentials are missing.

Credentials belong in `.env.local` or the hosting environment, never in chat or Git. Guest AI chat remains independent of account and memory setup.
