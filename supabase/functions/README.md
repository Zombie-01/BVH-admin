Supabase Edge Functions for ConstructionMaterialsAdmin

This folder contains example Supabase Edge Functions to serve admin pages and replace static/mock data.

Files:

- `get-metrics/index.ts` — returns basic aggregates and raw rows for orders, stores, products, and service_jobs.
- `stores/index.ts` — simple CRUD (list/create) for stores (GET/POST).

Deploying

1. Install and login to the Supabase CLI: https://supabase.com/docs/guides/cli
2. Set secrets for the functions (service role key):

```bash
supabase secrets set NEXT_PUBLIC_SUPABASE_URL="https://xyz.supabase.co"
supabase secrets set NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
```

3. Deploy functions:

```bash
supabase functions deploy get-metrics
supabase functions deploy stores
```

4. After deploy, set `SUPABASE_EDGE_URL` in your Next.js environment to the functions base URL, e.g. `https://<project>.functions.supabase.co`.

Local testing

- You can run functions locally with the Supabase CLI: `supabase functions serve get-metrics` and then call `http://localhost:54321/functions/v1/get-metrics`.

Security

- These example functions use the Service Role key to read/write the database. Keep that secret and only add it to function secrets, not to client-side envs.
