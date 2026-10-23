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
