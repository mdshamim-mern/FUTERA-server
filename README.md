# FUTERA Server

Independent backend extracted from FUTERA. Migration in progress; this is not yet a completed deployment.

Use Node 24, npm install, copy .env.example to .env.local, then npm run dev. Defaults to a clearly labelled sample catalog; commerce requires configured MongoDB and private session settings. No live inventory or payment claims.

## Provider activation
Google: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET together. Configure the exact redirect URI APP_URL/auth/google/callback in the owner-controlled Google Cloud OAuth client. Run npm run db:indexes. Google accounts are created as customers; existing password accounts require password sign-in and are never linked automatically.
Gemini: set GEMINI_API_KEY and GEMINI_MODEL together, with a model available to the provider account. Requests require commerce configuration and an authenticated session. Six requests per user and eighty globally per 15-minute window are enforced in MongoDB. No provider call is made while disabled. The two modes are catalog recommendations and PC-building support. Output is advisory, not authoritative pricing, stock or compatibility.
Reviews: authenticated ownership is server-derived; public responses contain only rating, text and date. Run indexes before enabling writes.
Deployment: Vercel Express preset, Node 24, repo root. APP_URL must be the exact frontend origin. Keep COMMERCE_ENABLED=false until Atlas, AUTH_SECRET and shipping configuration are valid. No production secrets belong in Git.

## Reference catalog and account-only deployment — 23 October 2026

CATALOG_SOURCE=reference serves 20 manufacturer-sourced, non-purchasable models from src/features/products/reference-data.ts. Every entry carries sourceUrl and reviewedAt; incomplete compatibility fields remain null. Original frontend category diagrams are not product photographs. No supplier price, inventory, review or sales record is fabricated.

isReference requires isSample=false, source/date metadata, and zero price/stock storage sentinels. Those zeros are never retail offers: UI renders "Price not supplied", price/availability filters exclude references, and authoritative order calculation rejects reference records even if their stored stock is corrupted. Seed fixtures remain labeled SAMPLE and isolated.

CHECKOUT_ENABLED=false blocks both review and confirmation before database work. COMMERCE_ENABLED=true can enable accounts, saved builds and provider integrations against a configured database without fabricated shipping terms when checkout is disabled. Keep checkout disabled until actual inventory and fulfillment terms are approved. Opaque revocable sessions remain authoritative; AUTH_SECRET signs checkout payloads and is not a client JWT setting.

Verification for this change: lint, typecheck, 165 tests across 12 files, and build pass locally. Production credential activation and live OAuth/Gemini checks remain separate requirements.
