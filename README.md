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

## Isolated demo inventory
Demo store — prices, stock and orders are illustrative. No payment is collected and no real fulfillment is promised.
Use only MONGODB_DB=futera_demo. Run npm run demo:activate to activate the fully sourced Ryzen 9 7950X; reruns preserve stock and owner changes. Run npx tsx scripts/demo-account.ts for the shared customer account, and npx tsx scripts/sync-enrichment.ts to update reference photography/price metadata. DEMO_LOGIN_ENABLED=true exposes customer-only auto-fill credentials only in futera_demo. Unrestricted admin credentials are never published.
Checkout requires CATALOG_SOURCE=mongodb, CHECKOUT_ENABLED=true and explicit SHIPPING_HOME_MINOR, SHIPPING_PICKUP_MINOR, PICKUP_ADDRESS. Demo virtual pickup is not a physical location.
Gemini Flash-Lite 3.5 returned validated real recommendations/support in approximately 2–6 seconds locally; deployment model configuration and live verification must be checked separately.

## Active demo deployment — 25 October 2026

Production API: https://futera-server.vercel.app. The isolated futera_demo Atlas database serves 20 photographed, priced demo products. Run `npm run demo:catalog` only with a non-production NODE_ENV and the isolated demo database; it preserves existing demo records/stock and rejects conflicting owner records before changes. `npm run demo:accounts` idempotently creates the public demo customer and read-only administrator.

Demo admin sessions expose demoReadOnly. Every administrative mutation is rejected server-side for isDemo administrators; their order/user/audit reports exclude private owner/customer records. Owner administrators retain authenticated, fresh-role-checked, transactional mutations and audit history. Report pagination is bounded to 20 records and filtered counts determine the last page.

Eight demo prices are based on retailer observations, twelve are labelled illustrative; all stock is illustrative. Demo COD creates an unpaid order, collects no payment and promises no physical delivery. Both deployed Gemini modes were verified with real answers on 25 October. Credentials and service keys remain in ignored environment files/Vercel configuration.

Acceptance checks on 25 October: lint/typecheck/build pass; 174 tests in 14 files pass, including every demo admin mutation denial, other-owner isolation and account pagination.

## Current sourced catalog release — 25 October 2026

The active catalog now contains 20 sourced-price models across all 14 categories; ten unverified older demo models were archived with stock and order history preserved. There are no active illustrative price records. Price sources and dates are in product metadata. Referenced prices are research observations, not guaranteed retail offers. Stock and unpaid COD orders remain an educational demo.

`npm run demo:curate` validates the complete replacement catalog before connecting, saves an ignored local product snapshot, and performs the source refresh and archive in one transaction. Only the isolated non-production futera_demo database is permitted. New product media must already be deployed before running it. The command preserves existing stock and does not delete orders. The earlier demo:catalog command describes the historical activation and should not replace this current curation workflow.

Backend acceptance for this release: lint/typecheck/build pass; 176 tests across 15 files pass. Current-model browser fixtures can be launched using scripts/e2e-server.mjs --current and never use Atlas.
`n## Assessment and local payment tests`n`nGET/POST /v1/admin/assessment requires an enabled administrator and the isolated futera_demo database. Workspace copies, bounded history and optimistic revisions live separately from storefront data. Public demo admins can edit only these copies. TEST_BKASH, TEST_NAGAD and TEST_CARD are local simulators, not provider integrations: approvals stay unpaid; decline/cancel cannot create orders or consume inventory. These methods are rejected for real retail inventory. All 184 backend tests passed with one worker. scripts/update-galleries.ts verifies deployed media and transactionally changes only galleries, preserving stock, prices and orders.
