# Remaining work

Updated 27 October 2026. Implementation and live verification are tracked separately.

## Implemented, awaiting external setup or verification

| Item | Still required |
| --- | --- |
| Supabase email sign-in | Configure the project URL/publishable key, allowed callback URLs, email template, and delivery. Verify a real sign-in and sign-out. |
| Private saved conversations | Apply `supabase/migrations/202610230001_conversations.sql`; run `supabase/tests/conversations.sql` in a test project; verify saving, loading, deletion, and two-account isolation against PostgreSQL. |
| Walrus memory | Provide the mainnet account object ID and registered delegate key. Run `npm run test:memory`, then verify a real store/recall/clear cycle. |
| Account-linked memory | Apply `supabase/migrations/202610270001_memory_spaces.sql` and run `supabase/tests/memory_spaces.sql` in a test project. Verify shared recall on two devices, account isolation, and clearing across devices. |
| Wallet connection | Browser-only Mainnet wallet controls, account switching, copy/explorer access, and disconnect are implemented. Verify connection approval, cancellation, and account changes with a real wallet extension. Mocked wallet lifecycle checks pass. |
| Deployment | Configure production environment values and Auth URLs, apply the migration, and verify the flows on the deployed Vercel URL. Production deployment has not been verified in this workspace. |

## Not implemented yet

1. **Guest-memory migration to accounts.** Existing guest facts remain separate. The installed SDK offers similarity-ranked recall and namespace metadata, but no complete fact-enumeration/migration API; reliable full-history migration needs a supported enumeration or ownership-transfer design.
2. **Wallet context in chatbot replies.** Wallet connection is implemented, but the connected address is not automatically sent to the AI. Explicit context-sharing controls remain to be built.
3. **Live blockchain tools in chat.** The model cannot fetch balances, transactions, network health, or current prices.
4. **Document retrieval for Knowledge.** Knowledge is a curated, searchable link collection; chat does not retrieve or ingest those documents.
5. **Individual memory review/editing/removal.** Settings clears the active account or guest namespace's search index. There is no per-fact editor or permanent encrypted-blob erasure.
6. **Production abuse and cost controls.** Distributed rate limits, per-user quotas, and operational monitoring are not in place.
7. **Dependency security updates.** Registry audit on 27 October reported five vulnerable packages (four high, one critical), including the existing Next.js version. Remediation and regression verification remain pending; adding wallet controls did not resolve these findings.

Saved conversations currently use explicit immutable snapshots. Automatic synchronization, editable snapshot titles, full-text history search, and account-deletion/export controls are not included in the current implementation.

## Current validation

- 56 offline application tests cover validation, consent, guest behavior, memory scope/isolation, conversation handlers, email callback logic, and wallet connection lifecycle.
- TypeScript, scoped lint, and production builds validate application integration.
- Database tests are supplied but have not run against a live PostgreSQL/Supabase project.
- Mainnet writes/deletion and real authentication/email delivery remain unverified because credentials are missing.

Credentials belong in `.env.local` or the hosting environment, never in chat or Git. Guest AI chat remains independent of account and memory setup.
